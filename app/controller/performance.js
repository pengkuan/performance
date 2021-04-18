"use strict";

const Controller = require("egg").Controller;
const lighthouse = require("lighthouse");
const puppeteer = require("puppeteer");
const constants = require("../config/constants");
const fs = require("fs");

class PerformanceController extends Controller {
  async index() {
    const { ctx } = this;
    const reqBody = ctx.request.body;
    console.log("请求：：：：", reqBody);
    const res = await this.run({
      url: reqBody.url || "https://www.sf-express.com/cn/sc/",
    });
    ctx.body = "success" + res;
  }
  async run(runOptions) {
    const context = await this.createPuppeteer().catch((e) => {
      console.log("createPuppeteer--- error------", e);
    });
    let result = "";
    try {
      result = await this.getLighthouseResult({
        ...context,
        runOptions,
      }).catch((e) => {
        console.log("getLighthouseResult--- error------", e);
      });
    } catch (e) {
      throw e;
    } finally {
      await this.disposeDriver(context);
    }
    return result;
  }
  async disposeDriver(context) {
    const { brower } = context;
    await brower.close();
  }
  async createPuppeteer() {
    const launchOptions = {
      headless: true,
      defaultViewport: {
        width: 1440,
        height: 960,
      },
      args: ["--no-sandbox", "--disabled-dev-shm-usage"],
    };
    const brower = await puppeteer.launch(launchOptions);
    const page = (await brower.pages())[0];
    return {
      brower,
      page,
    };
  }
  async getLighthouseResult(context) {
    const { brower, runOptions } = context;
    const { lhr, artifacts, report } = await lighthouse(
      runOptions.url,
      {
        port: new URL(brower.wsEndpoint()).port,
        output: "html",
        logLevel: "info",
      },
      {
        extends: "lighthouse:default",
        settings: {
          onlyCategories: ["performance"],
          formFactor: "desktop",
          throttling: constants.throttling.desktopDense4G,
          screenEmulation: constants.screenEmulationMetrics.desktop,
          emulatedUserAgent: constants.userAgents.desktop,
        },
      }
    );
    fs.writeFileSync("lhreport.html", report);
    context.lhr = lhr;
    context.artifacts = artifacts;
    return "得分" + lhr.categories.performance.score;
  }
}

module.exports = PerformanceController;
