#!/bin/bash

set -e

# ls templates directory then render html with minijinja
TEMPLATES_DIR="templates"

for file in "$TEMPLATES_DIR"/*; do
    filename=$(basename -- "$file")
    name="${filename%.*}"

    minijinja-cli $TEMPLATES_DIR/${filename} data.yaml -o ${name}.html

    # Check if the command was successful
    if [ $? -ne 0 ]; then
        echo "Error: Failed to process $file."
        exit 1
    fi
done

echo "All files processed successfully."
