const markdownShortcode = require("eleventy-plugin-markdown-shortcode");
const syntaxHighlight = require("@11ty/eleventy-plugin-syntaxhighlight");
const reports = require("./reports.json");
const scTable = require("./src/_utils/scTable.js");
const sampleImage = require("./src/_utils/sampleImage.js");
const scUri = require("./src/_utils/scUri.js");
const scName = require("./src/_utils/scName.js");
const slugify = require("./src/_utils/slugify.js");

module.exports = (function(eleventyConfig) {
  eleventyConfig.addFilter("sc_uri", scUri);
  eleventyConfig.addFilter("sc_name", scName);
 
  eleventyConfig.addFilter("slugify", slugify);

  eleventyConfig.addNunjucksShortcode('sc_table', scTable);
  eleventyConfig.addNunjucksShortcode('sample_image', sampleImage);

  eleventyConfig.addLayoutAlias("report", "report.njk");

  eleventyConfig.addPlugin(markdownShortcode);
  eleventyConfig.addPlugin(syntaxHighlight);
  
  // create a collection of issues specific to each report, sorted by success criterion
  for (let i=0; i < reports.reportNames.length; i++) {
    eleventyConfig.addCollection(reports.reportNames[i], function (collectionApi) {
      return collectionApi.getFilteredByGlob(`./src/reports/${reports.reportNames[i]}/**/*.md`)
        .filter(item => !(item.data.sc === "none") && !(item.data.sc === undefined))
        .sort((a, b) => {
          const arrA = a.data.sc.split('.');
          const arrB = b.data.sc.split('.');
          for (let i = 0; i < arrA.length; i++) {
              if (Number(arrA[i]) < Number(arrB[i])) return -1;
              if (Number(arrA[i]) > Number(arrB[i])) return 1;
          }
          return 0;
        });
    });
  }

  // create a collection of “tips” specific to each report (all issues with sc set to "none")
  for (let i=0; i < reports.reportNames.length; i++) {
    eleventyConfig.addCollection(`${reports.reportNames[i]}-tips`, function (collectionApi) {
      return collectionApi
        .getFilteredByGlob(`./src/reports/${reports.reportNames[i]}/**/*.md`)
        .filter(item => (item.data.sc === "none"))
    });
  }

  // Base Config
  return {
    dir: {
        input: "src",
        output: "dist",
        includes: "_includes",
        layouts: "_layouts",
        data: "_data"
    },
    templateFormats: ["njk", "md", "css", "png", "jpg", "svg"],
    htmlTemplateEngine: "njk",
    markdownTemplateEngine: "njk"
  }
});
