#!/bin/bash

# Script to migrate all SWR imports to use lib/swr
echo "🔄 Migrating all SWR imports to use lib/swr..."

# Find all TypeScript files with SWR imports, excluding the lib file itself
find src -name "*.ts" -o -name "*.tsx" \
  | grep -v "src/lib/swr.ts" \
  | grep -v "__tests__" \
  | grep -v ".test." \
  | grep -v ".spec." \
  | while read -r file; do
    
    # Check if file has SWR imports
    if grep -q "from 'swr'" "$file" || grep -q "from \"swr\"" "$file" || grep -q "from 'swr/" "$file" || grep -q "@config/use-swr-config-logged" "$file"; then
      echo "  📝 Updating $file"
      
      # Replace various SWR import patterns
      sed -i '' "s|from 'swr';|from 'lib/swr';|g" "$file"
      sed -i '' 's|from "swr";|from "lib/swr";|g' "$file"
      sed -i '' "s|from 'swr/|from 'lib/swr';|g" "$file"
      sed -i '' 's|from "swr/|from "lib/swr";|g' "$file"
      
      # Replace our config-based imports
      sed -i '' "s|from '@config/use-swr-config-logged';|from 'lib/swr';|g" "$file"
      sed -i '' 's|from "@config/use-swr-config-logged";|from "lib/swr";|g' "$file"
      
      # Handle mutation imports specifically
      sed -i '' "s|import useSWRMutation from 'lib/swr';|import { useSWRMutation } from 'lib/swr';|g" "$file"
      sed -i '' 's|import useSWRMutation from "lib/swr";|import { useSWRMutation } from "lib/swr";|g' "$file"
    fi
  done

echo "✅ All SWR imports migrated to lib/swr!"
echo ""
echo "📋 Summary of changes:"
echo "   - All 'swr' imports → 'lib/swr'"
echo "   - All 'swr/mutation' imports → 'lib/swr'"  
echo "   - All '@config/use-swr-config-logged' imports → 'lib/swr'"
echo "   - useSWRConfig, useSWR, useSWRMutation all available from 'lib/swr'"
echo ""
echo "🧹 Running linter to check for issues..."
yarn lint --no-fix | grep -E "(swr|SWR)" | head -10 || echo "✅ No SWR-related violations found!"