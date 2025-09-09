import path from 'path';
import type { NodePath, PluginObj, PluginPass } from '@babel/core';
import type { JSXOpeningElement } from '@babel/types';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import circleDependency from 'vite-plugin-circular-dependency';
import svgr from 'vite-plugin-svgr';


// import react from '@vitejs/plugin-react-swc'; << replaced with old plugin-react to support babel custom visitor function


// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svgr({ include: '**/*.svg' }),
    react({
      babel: {
        plugins: [
          // Add data-component attribute to html to help developers navigate through Tailwind classNames
          function emojiComponentAttribute(): PluginObj {
            return {
              visitor: {
                JSXOpeningElement(path: NodePath<JSXOpeningElement>, state: PluginPass) {
                  // Check if data-component attribute already exists
                  const hasDataComponent = path.node.attributes.some(attr => 
                    attr.type === 'JSXAttribute' && 
                    attr.name?.type === 'JSXIdentifier' && 
                    attr.name.name === 'data-component'
                  );

                  // Only add if it doesn't already exist
                  if (!hasDataComponent) {
                    // Extract component name from file path
                    const file = state.file?.opts?.filename;
                    const match = file?.match(/([^/\\]+)\.(jsx?|tsx?)$/);
                    const componentName = match?.[1] ?? 'Unknown';

                    path.node.attributes.unshift({
                      type: 'JSXAttribute',
                      name: { type: 'JSXIdentifier', name: 'data-component' },
                      value: {
                        type: 'StringLiteral',
                        value: `[!] ${componentName}`,
                      },
                    });
                  }
                },
              },
            };
          },
        ],
      },
    }),
    circleDependency({
      include: ['src/**/*'],
      exclude: ['node_modules/**', 'dist/**', '**/*.d.ts'],
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@app': path.resolve(__dirname, './src/app'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@config': path.resolve(__dirname, './src/config'),
      '@constants': path.resolve(__dirname, './src/constants'),
      '@features': path.resolve(__dirname, './src/features'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@services': path.resolve(__dirname, './src/services'),
      '@stores': path.resolve(__dirname, './src/stores'),
      '@shared-types': path.resolve(__dirname, './src/types'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@lib': path.resolve(__dirname, './src/lib'),
    },
  },
  base: '/',
});
