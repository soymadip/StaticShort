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
- **Index Page**: View all registered Short Links in one place.
- **Customizable Templates**: Design your own redirect pages with dynamic values 
- **Easy Deployment**: Works on GitHub Pages, Netlify, Vercel, or any static host


## Configuration

Configuration is done in [`config.js`](./config.js) file, in an object `config` :-

```js
exports.config = {
  // shortlinks, configurations
}
  ```

### Add Shortlink entries

- Add entries in `config.shortLinks` object :-
```js
exports.config = {

  shortLinks: {
    "exmpl": "https://example.com",
    "ig":    "https://www.instagram.com",
    "kirei": "https://github.com/soymadip/KireiSakura-Kit",
  }
  }
  ```

### Changing Defaults

Default options can be changed in the root of `config` object.  

```js
exports.config = {
  
  buildDir: "/output",
  template: "my_template.html",
  shortLinks: {
    "exmpl": "https://example.com",
  }
  }
  ```
Here are the available options :-

- `buildDir`: Directory where the generated files will be placed
- `deploy_path`: Base path where the site will be deployed.
    - Use `/` for root domain deployment (e.g., example.com/)
    - Use `/<sub>` for subdirectory deployment (e.g., `/sub` will be `example.com/sub/`)
- `addIndex`: Whether to generate an index page
- `template`: HTML [template](#adding-templates) for redirect pages
- `favicon`: Url or path of favicon
- `metaDelay`: Delay before triggering fallback redirect method


### Adding templates

Templates are used to generate the `index.html` files. 

Default template is mostly enough, but in case custom can be made:-

1. Add your template html files in `templates` dir.
2. CSS should be included in the same file either using,
   - `<style>` tag, or
   - inline CSS
3. Below vars can be used to get dynamic values:
   - `{{URL}}` -> Redirection URL
   - `{{DOMAIN}}` -> Domain name of redirection URL
   - `{{KEY}}` -> The shortlink path.
   - `{{FAVICON_URL}}` -> Favicon URL.

## Integration with Portosaurus

This project can be used alongside of [Portosaurus](https://github.com/soymadip/portosaurus).

To achieve integration, you can use same `config.js` and options but  
- Instead of `config` object's root, use `config.link_shortener`.
- Same for defining shortlinks, use `config.link_shortener.shortLinks`.
- Also an `enable` field for enabling the link shortener.

```js
exports.config = {
  
  link_shortener: {
    enable: true,
    buildDir: "/output",
    template: "my_template.html",
    shortLinks: {
      "exmpl": "https://example.com",
    }
  }
}
  ```

## Development 

StaticShort includes a built-in development server for local testing:

```bash
# Start the development server
pnpm start
# or
npm run start
```
This will compile your shortlinks and serve them locally for testing before deployment


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
  If tools like `curl` or `wget` are used, generated `index.html`'s content is returned instead of following redirection.

- The codebase is a bit messy, But it gets its job done reliably.


## Credits

- This project is inspired by [urlzap](https://github.com/brunoluiz/urlzap).
- The default templates are created by [deepseek R1](https://www.deepseek.com/) hosted using [Ollama](https://ollama.com/library/deepseek-r1).
- [KireiSakura Kit](https://github.com/soymadip/KireiSakura-Kit) for the release workflow.
- StackOverflow threads, for providing me support.
