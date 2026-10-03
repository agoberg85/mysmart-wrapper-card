import { nodeResolve } from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';

export default {
    input: 'src/mysmart-wrapper-card.js',
    output: {
        file: 'mysmart-wrapper-card.js',
        format: 'es',
        sourcemap: true,
    },
    plugins: [
        nodeResolve(),
        terser({
            format: {
                comments: false,
            },
        }),
    ],
};
