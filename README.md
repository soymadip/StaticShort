<div align="center">
  <img 
    src="Assets/icon.png" 
    width=120 
    alt="static-short"
  >
  <h1>StaticShort</h1>
  <p>A static URL shortener that generates HTML files for redirects, without need of a backend server.</p>
</div>

## Features

- **No Backend Server Required**: Pure static HTML, JS redirects, work anywhere
- **Fast Redirects**: Instant redirects with progress indicator
- **Multiple Redirect Methods**: JavaScript redirection with HTML meta fallback
- **Index Page**: View all regestered Short Links in one place.
- **Customizable Templates**: Design your own redirect pages with dynamic values 
- **Easy Deployment**: Works on GitHub Pages, Netlify, Vercel, or any static host


## Configuration


### Add Shortlink entries

- Edit the [`config.js`](./config.js) file to define your short URLs.

- The entries should be in below format :-
```js
exports.config = {

  shortLinks: {
    "exmpl": "https://example.com",
    "kirei": "https://github.com/soymadip/KireiSakura-Kit",
    "example": "https://example.com",
  }}
  ```

### Changing Defaults

StaticShort can be configured using the same [`config.js`](./config.js) file.<br> 
Here are the available options :-

- `buildDir`: Directory where the generated files will be placed
- `deploy_path`: Base path where the site will be deployed.
    - Use `/` for root domain deployment (e.g., example.com/)
    - Use `/<sub>` for subdirectory deployment (e.g., `/sub` will `example.com/demo/`)
- `shortLinkDB`: File containing the shortlink definitions
- `addIndex`: Whether to generate an index page
- `template`: HTML [template](#adding-templates) for redirect pages
- `favicon`: Url or path of favicon
- `metaDelay`: Delay before trigarring fallback redirect method


### Adding templates

Templates are used to generate the `index.html` files. 

Default template is mostly enough, but in case custom can be made:-

1. Add your template html files in `templates` dir.
2. Below vars can be used to get dynamic values:
   - `{{URL}}` -> Redirection URL
   - `{{DOMAIN}}` -> Domain name of redirection URL
   - `{{KEY}}` -> The shortlink path.
   - `{{FAVICON_URL}}` -> Favicon URL.


## Deployment

1. For GitHub Pages, 
    - just fork this repo
    - Go to repo `settings`>`Pages` & select `Build & Deployment` to `GitHub Actions`
    - [Customize](#configuration) as you like.
    - Commit your changes & GitHub should do the rest automatically.
    - go to `<your username>.github.io/<repo-name>`

2. For other platforms, 
    - Generate static files using `npm run build` command
    - This will generate static files in `build` dir.
    - Simply upload the generated files to any static hosting service:
        - Netlify
        - Vercel
        - Firebase Hosting
        - Or any web server that can serve static HTML files


## Limitation

- As this kind of redirection is done at client side,<br>
  If tools like `curl` or `wget` is used, generated `index.html`'s content is returned instead of following rediection.

- The codebase is a bit messy, But it gets it's job done reliably.


## Credits

- This project is inspired be [urlzap](https://github.com/brunoluiz/urlzap).
- The default templates are created by [deepseek R1](https://www.deepseek.com/) hosted locally using [Ollama](https://ollama.com/library/deepseek-r1).
- StackOverflow therads, for providing me support.
