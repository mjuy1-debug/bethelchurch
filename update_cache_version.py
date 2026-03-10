import os
import re

directory = '.'
new_version = '20260310_1430'

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.html'):
            filepath = os.path.join(root, file)
            print(f"Processing {filepath}...")
            
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Regex to find data.js?v=...
                # It handles existing version strings or just data.js
                new_content = re.sub(r'data\.js(\?v=[0-9_]+)?', f'data.js?v={new_version}', content)
                
                if content != new_content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated {filepath}")
                else:
                    print(f"No changes for {filepath}")
                    
            except Exception as e:
                print(f"Error processing {filepath}: {e}")
