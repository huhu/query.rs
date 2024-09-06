use argh::FromArgs;
use reqwest;
use serde_json::Value;
use std::fs;
use std::path::Path;
use tokio::runtime::Runtime;

use super::Task;

/// Std task
#[derive(FromArgs)]
#[argh(subcommand, name = "std")]
pub struct StdTask {
    /// rust version
    #[argh(option, short = 'v')]
    version: String,
}

async fn fetch_std_index(version: &str) -> crate::Result<Value> {
    let url = format!("https://query.rs/index/std/{}", version);
    let response = reqwest::get(&url).await?.json().await?;
    Ok(response)
}

fn save_to_file(data: &Value, file_path: &Path, variable_name: &str) -> crate::Result<()> {
    let json_string = serde_json::to_string(data)?;
    let content = format!(
        "const {variable_name} = new Map(JSON.parse(`{}`));\nexport default {variable_name};",
        json_string.replace("`", "\\`").replace("\\\"", "")
    );
    fs::write(file_path, content)?;
    Ok(())
}

impl StdTask {
    async fn run(&self) -> crate::Result<()> {
        let response = fetch_std_index(&self.version).await?;
        let search_index = &response["searchIndex"];
        let desc_shards = &response["descShards"];

        let std_docs_path = Path::new("../lib/index/std-docs.js");
        let desc_shards_path = Path::new("../lib/index/desc-shards/std.js");

        save_to_file(search_index, std_docs_path, "searchIndex")?;
        save_to_file(desc_shards, desc_shards_path, "stdDescShards")?;

        println!("Files updated successfully.");
        Ok(())
    }
}

impl Task for StdTask {
    fn execute(&self) -> crate::Result<()> {
        let rt = Runtime::new()?;
        rt.block_on(self.run())?;
        Ok(())
    }
}
