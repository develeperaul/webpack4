const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const TerserWebpackPlugin = require('terser-webpack-plugin');
const OptimizeCssAssetsWebpackPlugin = require('optimize-css-assets-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack');



const isDev = process.env.NODE_ENV === 'development';
const isProd = !isDev;

const filename = (ext) => isDev ? `[name].${ext}` : `[name].[contenthash].${ext}`;
const optimization = () => {
    const configObj = {
    splitChunks: {
        chunks: 'all'
    }
    };
    if (isProd) {
        configObj.minimizer = [
            new OptimizeCssAssetsWebpackPlugin(),
            new TerserWebpackPlugin()
        ];
    }

    return configObj;
};

const plugins = () => {
    const basePlugins = [
        new HTMLWebpackPlugin({
        template: path.resolve(__dirname, 'src/index.html'),
        filename: 'index.html',
        minify: {
            collapseWhitespace: isProd
        }
        }),
        new CleanWebpackPlugin(),
        new MiniCssExtractPlugin({
        filename: `./css/${filename('css')}`
        }),
        new CopyWebpackPlugin({
        patterns: [
            {from: path.resolve(__dirname, 'src/assets') , to: path.resolve(__dirname, 'app')}
        ]
        }),
    ];

    if (isProd) {
        basePlugins.push(
        new ImageminPlugin({
            bail: false, // Ignore errors on corrupted images
            cache: true,
            imageminOptions: {
            plugins: [
                ["gifsicle", { interlaced: true }],
                ["jpegtran", { progressive: true }],
                ["optipng", { optimizationLevel: 5 }],
                [
                "svgo",
                {
                    plugins: [
                    {
                        removeViewBox: false
                    }
                    ]
                }
                ]
            ]
            }
        })
        )
    }

    return basePlugins;
};

module.exports = {
    context: path.resolve(__dirname,'src'),
    mode: 'development',

    entry: './js/index.js',

    output: {
        filename: `./js/${filename('js')}`,
        path: path.resolve(__dirname, 'app'),
        publicPath: '',
        assetModuleFilename: 'img/[name][ext]',
    },
    resolve: {
		extensions: [
			'.js',
			'.json',
			'.xml',
			'.csv',
			'.png',
			'.svg',
			'.jpg',
			'.jpeg',
			'.sass',
			'.scss',
		],
    },
    devServer: {
        historyApiFallback: true,
        contentBase: path.resolve(__dirname, 'app'),
        open: true, // авто открытие браузера
        compress: true, //для сжатия 
        hot: true,
        port: 3000,
    },
    
    optimization: optimization(),
    plugins: plugins(),
    devtool: isProd ? false : 'source-map',
    module: {
        rules: [
            {
                test: /\.html$/i,
                loader: 'html-loader',
                options: {
                    sources: true
                }
            },
            {
                test: /\.css$/i,
                use: [{
                    loader: MiniCssExtractPlugin.loader,
                    options: {
                        hmr: isDev
                    }
                }, 'css-loader']
            },
            {
                test: /\.s[ac]ss$/i,
                use: [{
                    loader: MiniCssExtractPlugin.loader, 
                    options: {
                        publicPath: (resourcePath, context)=>{
                            return path.relative(path.dirname(resourcePath), context) + '/';
                        },    
                    }
                }, 'css-loader', 'sass-loader']
                
            },
            {
				test: /\.js$/,
				exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.(?:|gif|png|jpg|jpeg|svg)$/,
                type: 'asset/resource',
                use: [
					{
						loader: 'webp-loader',
						options: {
							quality: 70,
						},
					},
				],
                generator: {
					filename: 'image/[name][ext]',
				},
            
            },
            {
                test: /\.(woff(2)?|eot|ttf|otf|svg|)$/,
                type: 'asset/resource',
                generator: {
					filename: 'fonts/[name][ext]',
				},
            },
            {
				test: /\.svg$/,
				type: 'asset/resource',
				generator: {
					filename: 'svg/[name][ext]',
				},
			},
        ]
    }
}