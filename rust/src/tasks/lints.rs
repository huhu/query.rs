use argh::FromArgs;
use rayon::prelude::*;
use serde::Deserialize;
use std::clone::Clone;
use std::collections::HashMap;
use std::fmt::{self, Formatter};
use std::fs;
use std::path::Path;
use tokio::runtime::Runtime;

use crate::minify::Minifier;
use crate::tasks::Task;

const LINT_URL: &str = "https://rust-lang.github.io/rust-clippy/stable/lints.json";
const LINTS_INDEX_PATH: &str = "../lib/index/lints.js";

/// Lint task
#[derive(FromArgs)]
#[argh(subcommand, name = "lints")]
pub struct LintsTask {
    /// destination path
    #[argh(option, short = 'd', default = "LINTS_INDEX_PATH.to_string()")]
    dest_path: String,
}

#[derive(Deserialize, Debug)]
#[serde(rename_all = "lowercase")]
enum LintLevel {
    Allow,
    Warn,
    Deny,
    Deprecated,
    None,
}

impl fmt::Display for LintLevel {
    fn fmt(&self, f: &mut Formatter<'_>) -> fmt::Result {
        match self {
            Self::Allow => write!(f, "Allow"),
            Self::Warn => write!(f, "Warn"),
            Self::Deny => write!(f, "Deny"),
            Self::Deprecated => write!(f, "Deprecated"),
            Self::None => write!(f, "None"),
        }
    }
}

#[derive(Deserialize, Debug)]
struct Lint {
    id: String,
    level: LintLevel,
    docs: Option<String>,
}

async fn fetch_clippy_lints() -> crate::Result<Vec<Lint>> {
    let lints = reqwest::get(LINT_URL).await?.json().await?;
    Ok(lints)
}

impl Task for LintsTask {
    fn execute(&self) -> crate::Result<()> {
        let rt = Runtime::new()?;
        rt.block_on(self.run())?;
        Ok(())
    }
}

impl LintsTask {
    async fn run(&self) -> crate::Result<()> {
        let lints: HashMap<String, [String; 2]> = fetch_clippy_lints()
            .await?
            .par_iter()
            .filter_map(|lint| {
                if let Some(docs) = lint
                    .docs
                    .as_ref()
                    .and_then(|d| d.trim().strip_prefix("### What it does"))
                {
                    let mut desc = docs.replace(['`', '#'], "");
                    desc.truncate(100);
                    Some((
                        lint.id.clone(),
                        [
                            lint.level.to_string(),
                            html_escape::encode_text(&desc).to_string(),
                        ],
                    ))
                } else {
                    None
                }
            })
            .collect();

        let contents = format!(
            "const lintsIndex={};export default lintsIndex;",
            serde_json::to_string(&lints)?
        );
        let path = Path::new(&self.dest_path);
        fs::write(path, Minifier::minify_js(&contents))?;
        println!("\nGenerate javascript lints index successful!");
        Ok(())
    }
}
