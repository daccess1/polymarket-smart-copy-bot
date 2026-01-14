import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        coverage: {
            exclude: [
                'test/**',
                'template/**',
                'src/**/*.d.ts',
                'vite.config.ts',
                'src/index.ts',
                'src/enable-auth.ts',
                'src/types/user/**',
                'src/common/**',
            ],
        },
    },
});