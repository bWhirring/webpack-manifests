const fse = require('fs-extra');
const path = require('path');
const rimraf = require('rimraf');

const PLUGINNAME = 'Manifest';

class Manifest {
  constructor(
    opts = {
      filename: '',
      outputDir: '',
    },
  ) {
    this.file = opts.filename || 'manifest.json';
    this.outputDir = opts.outputDir;
  }

  apply(compiler) {
    let { file, outputDir } = this;
    const files = {};

    const { path: configPath, publicPath = '' } = compiler.options.output;

    /**
     * 如果没有设置输出路径，则取为 path
     */
    if (!outputDir) {
      outputDir = configPath;
    } else {
      outputDir = path.resolve(outputDir);
    }

    compiler.hooks.compile.tap(PLUGINNAME, () => {
      console.log(`clean previous publicPath resource... \n`);
      rimraf.sync(`${configPath}/`);
    });
    compiler.hooks.afterCompile.tap(PLUGINNAME, (compilation) => {
      let { filename } = compilation.outputOptions;
      const { hash, chunks } = compilation;
      filename = filename.replace('[hash]', hash);
      chunks.map((v) => {
        let bundleName = filename.replace('[name]', v.name);
        bundleName = v.name ? bundleName : `${v.id}.${bundleName}`;
        if (bundleName.endsWith('.js')) files[v.name || v.id] = publicPath + bundleName;
      });
      fse.outputFileSync(
        path.resolve(`${outputDir}/${file}`),
        JSON.stringify(files, null, 2),
      );
    });
  }
}

module.exports = Manifest;
