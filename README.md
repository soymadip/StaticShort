<div align="center">
  <img src="Assets/icon.png" width=120 alt="static-short">
  <h1>StaticShort</h1>
<p>A simple static URL shortener that generates HTML files for redirects, without need of a backend server.</p>
</div>

## Features

- **No Backend Server Required**: Pure static HTML redirects that work anywhere
- **Fast Redirects**: Instant redirects with progress indicator
- **Multiple Redirect Methods**: JavaScript redirection with HTML meta fallback
- **Index Page**: View all regestered Short Links in one place.
- **Customizable Templates**: Design your own redirect pages with dynamic values 
- **Easy Deployment**: Works on GitHub Pages, Netlify, Vercel, or any static host


## Configuration


### Define Shortlinks

- Edit the [`shortlinks.jsonc`](./shortlinks.jsonc) file to define your short URLs.

- The entries should be in below format :-
  ```jsonc
  {
    // if domain is a.com

    "gh": "https://github.com/soymadip",      // a.com/gh   -> https://github.com/soymadip
    "blog": "https://soymadip.github.io",     // a.com/blog -> https://soymadip.github.io

  }
  ```

### Change Defaults

Edit the [`static-short.jsonc`](./static-short.jsonc) file to customize the build directory and other settings:

```jsonc
{
  // Directory where shortlink folders will be generated
  "buildDir": "build",
  
  // Add Index page at root with shortlink index
  "addIndex": true,
  
  // File containing shortlink definitions
  "shortLinkDB": "shortlinks.jsonc",
  
  // Template to use from templates directory
  "template": "default.html",
  
  // Favicon url
  "favicon": "url/to/favicon",
  
  // Delay before trigarring fallback redirect method.
  "metaDelay": "0.2",
  
}
```


### Adding templates

Templates are used to generate the `index.html` files. 

Default template is mostly enough, but in case custom can be made:-

1. Add your template html files in `templates` dir.
2. Below vars can be used to get dynamic values:
   - `{{url}}` -> Redirection URL
   - `{{domain}}` -> Domain name of redirection URL
   - `{{key}}` -> The shortlink path.
   - `{{faviconUrl}}` -> Favicon URL.


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

As this kind of redirection is done at client side,<br>
if tools like `curl` or `wget` is used, generated `index.html`'s content is returned instead of following rediection.


## Credits

- This project is inspired be [urlzap](https://github.com/brunoluiz/urlzap).
- The default templates are created by [deepseek R1](https://www.deepseek.com/) hosted locally using [Ollama](https://ollama.com/library/deepseek-r1).
- StackOverflow therads, for providing me support.
