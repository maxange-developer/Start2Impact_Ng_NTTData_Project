module.exports = function (config) {
  config.set({
    basePath: "",
    frameworks: ["jasmine", "@angular-devkit/build-angular"],
    plugins: [
      require("karma-jasmine"),
      require("karma-chrome-launcher"),
      require("karma-jasmine-html-reporter"),
      require("karma-coverage"),
      require("@angular-devkit/build-angular/plugins/karma"),
    ],
    client: {
      jasmine: {
        random: false,
      },
      clearContext: false,
    },
    jasmineHtmlReporter: {
      suppressAll: true,
    },
    coverageReporter: {
      dir: require("path").join(
        __dirname,
        "./coverage/Start2Impact_NTTData_Angular"
      ),
      subdir: ".",
      reporters: [
        { type: "html" },
        { type: "text-summary" },
        { type: "lcovonly" },
      ],
    },
    reporters: ["progress", "kjhtml", "coverage"],
    browsers: ["ChromeHeadless"],
    restartOnFileChange: true,
    singleRun: false,
    autoWatch: true,
    customLaunchers: {
      ChromeHeadlessCI: {
        base: "ChromeHeadless",
        flags: [
          "--no-sandbox",
          "--disable-web-security",
          "--disable-gpu",
          "--remote-debugging-port=9222",
        ],
      },
    },
  });
};
