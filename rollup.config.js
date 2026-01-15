import typescript from '@rollup/plugin-typescript';
import terser from '@rollup/plugin-terser';

export default {
    input: 'src/index.ts',
    output: [
        {
            file: 'dist/falling-animation.cjs',
            format: 'cjs',
            sourcemap: false,
            exports: 'named'
        },
        {
            file: 'dist/falling-animation.esm.js',
            format: 'esm',
            sourcemap: false
        },
        {
            file: 'dist/falling-animation.umd.js',
            format: 'umd',
            name: 'FallingAnimation',
            sourcemap: false,
            exports: 'named'
        },
        {
            file: 'dist/falling-animation.umd.min.js',
            format: 'umd',
            name: 'FallingAnimation',
            sourcemap: false,
            exports: 'named',
            plugins: [terser()]
        }
    ],
    plugins: [
        typescript({
            tsconfig: './tsconfig.json',
            declaration: true,
            declarationDir: 'dist/types'
        })
    ]
};
