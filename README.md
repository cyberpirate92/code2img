# code2img 

[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=for-the-badge)]() [![GitHub license](https://img.shields.io/github/license/cyberpirate92/code2img.svg?style=for-the-badge)](https://github.com/cyberpirate92/code2img/blob/master/LICENSE) ![Website](https://img.shields.io/website?style=for-the-badge&down_color=red&down_message=down&label=code2img.vercel.app&up_color=green&up_message=live%20%F0%9F%8E%89&url=https%3A%2F%2Fimg.shields.io%2Fwebsite%2Fhttps%2Fcode2img.vercel.app)

A REST API to get pretty images of code snippets with syntax highlighting created using Puppeteer, PrismJS and Vercel.

![](./images/banner.png)

![](./images/demo.gif)

## Image generated with code2img API

![](./images/response.png)

# Contents
1. [Tech Used](#Tech%20Used)
2. [Installation](#Installation)
3. [Using the API](#Using%20The%20API)
4. [API Documentation](#API%20Documentation)
5. [Extensions](#Extensions)

## Tech Used
| Technology | Description                                                                           | Link                  |
| ---------- | ------------------------------------------------------------------------------------- | ----------------------- |
| CSS3       | Cascading Style Sheets                                                                | https://developer.mozilla.org/en-US/docs/Web/CSS                    |
| HTML5      | Hyper Text Markup Language                                                            | https://developer.mozilla.org/en-US/docs/Web/HTML                    |
| JavaScript | High Level, Dynamic, Interpreted Language                                             | https://developer.mozilla.org/en-US/docs/Web/JavaScript                    |
| NodeJS     | Open Source Javascript Runtime Environment, Execute Javascript code server side | https://nodejs.org/en/  |
| PrismJS  | Lightweight, extensible syntax highlighter for the web | https://prismjs.com |
| Puppeteer       | Node library which provides a high-level API to control Chromium over the DevTools protocol | https://pptr.dev |
| Vercel CLI | Run Vercel serverless functions locally | https://vercel.com/docs/cli |

## Installation

### Running Locally

_Make sure [Node.js](https://nodejs.org/en/) and [NPM](https://www.npmjs.com/) are installed._

1. Clone/Download the repository and `cd` into the project directory

```bash
git clone https://github.com/cyberpirate92/code2img.git
cd code2img
```

2. Install dependencies

```bash
npm install
```

3. Run the dev server

```bash
NODE_ENV=development vercel dev
```

The app will now be running at https://localhost:3000

## Using the API

### Using Postman

Postman is an API client that makes API testing easy.

1. Download and install Postman from https://www.postman.com/downloads/
2. Open Postman and import the `Postman` folder.
3. In the `environment` dropdown, select `code2img-local` if you are running the app locally, otherwise select `code2img-prod`.
4. You can find the API operations in the sidebar under `code2img`.

## API Documentation

The API supports the following 3 operations

* [Get Image](#Get%20Image)
* [List themes](#List%20Themes)
* [List languages](#3List%20Languages)

### Get Image

- HTTP Method: `POST`
- Endpoint: `/api/to-image`
- Content-Type: `text/plain`
- Response Content Type: `image/png`

**Query Parameters**

| Parameter | Required? | Data type | Description                                                                           | Possible/Example values                 |
| ----------| --------- | ----------|  ------------------------------------------------------------------------------------- | ----------------------- |
| theme | required | `string` | The name of the color theme. All the color themes are from  https://github.com/PrismJS/prism-themes  | `a11y-dark`, `atom-dark`, `base16-ateliersulphurpool.light`, `cb`, `darcula`, `default`, `dracula`, `duotone-dark`, `duotone-earth`, `duotone-forest`, `duotone-light`, `duotone-sea`, `duotone-space`, `ghcolors`, `hopscotch`, `material-dark`, `material-light`, `material-oceanic`, `nord`, `pojoaque`, `shades-of-purple`, `synthwave84`, `vs`, `vsc-dark-plus`, `xonokai`. _Samples for all themes can be found [here](./THEMES.md)._ |
| language | required | `string` | The name of the programming language. This will be used for syntax highlighting. | `c`, `css`, `cpp`, `go`, `html`, `java`, `javascript`, `jsx`, `php`, `python`, `rust`, `typescript` |
| line-numbers | optional. Default = `false` | `string` | Show/Hide line numbers. | `true` / `false` |
| scale | optional. Default = `2` | `number` | The device scale factor used to render the image. Higher values will lead to bigger image resolutions and higher file sizes. Default value is `2` | Any number in the inclusive range `1`-`5` |
| background-color | optional. Default = `yellow` | `string` | Set a background color. Any valid values used for css [`background`](https://developer.mozilla.org/en-US/docs/Web/CSS/background) property can be used. Alternatively, If a background image is required, use  `background-image` instead. | `red`, `#f00`, `#ff0000` `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.6)`, `radial-gradient(circle, rgba(63,94,251,1) 0%, rgba(252,70,107,1) 100%)` |
| background-image | optional | `string` | Set a background image. Any valid image URL can be used. Higher resolution images can cause response to be significantly delayed. | `https://picsum.photos/1920/1080` |
| show-background | optional. Default = `true` | `string` | Show/Hide background. | `true` / `false` |
| padding | optional. Default = `5` | `number` | Amount of padding in the background. Setting `padding` to `0` is equivalent to setting `show-background=false`. | Any number in the inclusive range `0`-`15` |

**Description:** Given a code snippet in the request body, an image will be returned with the specified theme and language options.

### List themes
- HTTP Method: `GET`
- Endpoint: `/api/themes`
- Response Content Type: `application/json`

**Description:** Get a list of all supported themes.

### List languages
- Http Method: `GET`
- Endpoint: `/api/languages`
- Response Content Type: `application/json`

**Description:** Get a list of all supported languages.

## Extensions

| Platform | Source | Download |
|----------|--------|----------|
| Google Chrome Extension | [Source Code](https://github.com/cyberpirate92/code2img-chrome) | [Chrome Web Store](https://chrome.google.com/webstore/detail/code2image/abloihkaeipjifnhehnicpjfjoaclngo) |
