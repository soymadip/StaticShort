<div align="center">
  <h1>StaticShort</h1>
<p>A simple static URL shortener that generates HTML files for redirects, without need of a backend server.</p>
</div>

## Features

- **No Backend Server Required**: Pure static HTML redirects that work anywhere
- **Fast Redirects**: Instant redirects with progress indicator
- **Multiple Redirect Methods**: JavaScript redirection with HTML meta fallback
- **Customizable Templates**: Design your own redirect pages with variables
- **Easy Deployment**: Works on GitHub Pages, Netlify, Vercel, or any static host


## Configuration

Edit the [`static-short.jsonc`](./static-short.jsonc) file to customize the output directory and other settings:


### Define Shortlinks

- Edit the [`shortlinks.jsonc`](./shortlinks.jsonc) file to define your short URLs:


### Adding templates

Templates are used to generate the `index.html` files. 

1. Add your template html files in `templates` dir.
2. Below vars can be used to get dynamic values:
   - `{{url}}` -> Redirection URL
   - `{{domain}}` -> Domain name of redirection URL
   - `{{key}}` -> The shortlink path.


## Deployment

>[!WARNING]
> GitHub pages workflow is yet to be done.

1. For GitHub Pages, 
    - just fork this repo
    - [Customize](#configuration) as you like
    - Go to repo `settings>Pages` & select `Build & Deployment` to `GitHub Actions`

2. For other platforms, 
    - Generate static files using `npm run build` command
    - This will generate static files in `build` dir.
    - Simply upload the generated files to any static hosting service:
        - Netlify
        - Vercel
        - Firebase Hosting
        - Or any web server that can serve static HTML files


## Limitation

As this kind of redirection is done at client side, 
if tools like `curl` or `wget` is used, generated `index.html`'s content is returned instead of following rediection.


## Credits

- This project is inspired be [urlzap](https://github.com/brunoluiz/urlzap).
- The default template is created by [deepseek R1](https://www.deepseek.com/) hosted locally using [Ollama](https://ollama.com/library/deepseek-r1).
