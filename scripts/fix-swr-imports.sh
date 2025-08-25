#!/bin/bash

# Script to automatically fix useSWRConfig imports to use the logged version
# This ensures all mutations are properly logged for debugging

echo "🔄 Fixing useSWRConfig imports to use logged version..."

# Find all TypeScript files that import useSWRConfig from 'swr'
# Exclude the wrapper file itself and any test files
find src -name "*.ts" -o -name "*.tsx" \
  | grep -v "use-swr-config-logged.ts" \
  | grep -v "__tests__" \
  | grep -v ".test." \
  | grep -v ".spec." \
  | xargs grep -l "import.*useSWRConfig.*from 'swr'" \
  | while read -r file; do
    echo "  📝 Updating $file"
    # Replace the import statement
    sed -i '' "s|import { useSWRConfig } from 'swr';|import { useSWRConfig } from '@config/use-swr-config-logged';|g" "$file"
    sed -i '' "s|import { useSWRConfig } from \"swr\";|import { useSWRConfig } from '@config/use-swr-config-logged';|g" "$file"
    
    # Handle cases where useSWRConfig is imported with other things
    sed -i '' "s|useSWRConfig } from 'swr'|useSWRConfig } from 'swr'; import { useSWRConfig } from '@config/use-swr-config-logged'|g" "$file"
    sed -i '' "s|useSWRConfig,|// useSWRConfig removed - use logged version instead|g" "$file"
  done

echo "✅ All useSWRConfig imports have been updated!"
echo "📋 Summary of changes:"
echo "   - Replaced 'swr' imports with '@config/use-swr-config-logged'"
echo "   - All mutations will now be logged when debug mode is enabled"
echo "   - Use Cmd+Shift+L or enableMutationLogging() to enable logging"

echo ""
echo "🧹 Running linter to check for any remaining issues..."
yarn lint --no-fix | grep "useSWRConfig" || echo "✅ No remaining useSWRConfig violations found!"