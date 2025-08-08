import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import svgr from 'vite-plugin-svgr';

// import react from '@vitejs/plugin-react-swc'; << replaced with old plugin-react to support babel custom visitor function

import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    svgr({ include: '**/*.svg' }),
    react({
      babel: {
        plugins: [
          // Add data-component attribute to html to help developers navigate through Tailwind classNames
          function emojiComponentAttribute() {
            return {
              visitor: {
                JSXOpeningElement(path, state) {
                  // Extract component name from file path
                  const file = state.file.opts.filename;
                  const match = file.match(/([^/\\]+)\.(jsx?|tsx?)$/);
                  const componentName = match?.[1] ?? 'Unknown';

                  path.node.attributes.unshift({
                    type: 'JSXAttribute',
                    name: { type: 'JSXIdentifier', name: 'data-component' },
                    value: {
                      type: 'StringLiteral',
                      value: `[!] ${componentName}`,
                    },
                  });
                },
              },
            };
          },
        ],
      },
    }),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@app': path.resolve(__dirname, './src/app'),
      '@shared': path.resolve(__dirname, './src/shared'),
      '@features': path.resolve(__dirname, './src/features'),
    },
  },
  base: '/',
});
