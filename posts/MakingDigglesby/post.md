### A story about how I made this project far harder than it should have been

I have been sitting on the domain digglesby.com and have been wanting to build a personal website for a while. With winter break coming up it gave me an opportunity to both finally build a personal blog but also learn more Isomorphic React and CouchDB.

### The First Attempt

My starting point was my [Isomorphic React Template](https://github.com/digglesby/isomorphic-react-router-template) which I made after getting tired of writing the same Babel and Webpack configs just to get something isomorphic to work with react router.

The template uses [isomorphic-webpack](https://github.com/gajus/isomorphic-webpack) to handle the server side render. It works by spinning up a V8 Virtual Machine with a context similar to a browser's for each render. Upside to this is that the code is truly isomorphic; code running on the server is running near exactly the same to the code running on the client.

However isomorphic-webpack's consistency comes at the expense of easily getting data from the VM running react to the server, compounded by the fact that isomorphic-webpack only waits long enough for the first render() call before unloading the VM. Roughly, this means that for components that need to be preloaded from a database (like this blog) can't easily call the API from the VM context or signal what the server should preload.

The way I solved this was to hard map each URL to an API call as needed.

```javascript
import pathToRegexp from 'path-to-regexp';
import APIService from './APIService';

class URLPreloadingService{

  constructor(){
    this.urlMap = {
      '/':[
        function( keys ){

          return {
            url:"/posts",
            method:"get",
            data:null
          };
        }

      ],
      '/post/:posturl':[

        function( keys ){

          return {
            url:"/post/" + keys.posturl,
            method:"get",
            data:null
          };
        }

      ]
    };
  }

  ...

  preloadURL( path ){

    return new Promise(function(resolve, reject){
      let match = this.matchPath( path );

      if (match){
        let requests = this.getPreloadRequests(match);

        APIService.preloadPage(requests, match).then(function(){
          resolve();
        });
      }else{
        resolve();
      }
    }.bind(this));  
  }
}
```

`APIService` here is just a class that makes returns a promise for all of the AJAX requests. The `preloadURL` promise MUST resolve before isomorphic-react loads the page in order for all the the react elements to have their data on render.

However, in order to maintain consistency between the server and client when hydrating every preloaded AJAX response has to be embeded in the server response somehow, that's where `StatePreservationService` comes in!

```javascript
class StatePreservationService{

  constructor(){
    this.params = {};

    if (typeof window !== 'undefined'){
      if (window.dehydratedState != undefined){
        this.params = window.dehydratedState;
      }
    }

    this.get = this.get.bind(this);
    this.put = this.put.bind(this);
    this.dehydrate = this.dehydrate.bind(this);
    this.clear = this.clear.bind(this);
  }

  get(key){
    if (this.params.hasOwnProperty(key)){
      return this.params[key];
    }else{
      return null;
    }
  }

  put(key,value){
    this.params[key] = value;
  }

  dehydrate(){
    return "<script>window.dehydratedState="+JSON.stringify(this.params)+";</script>";
  }

  clear(){
    this.params = {};
    window.dehydratedState = this.params;
  }
}
```

Essentially `StatePreservationService` is a dumb store for json data with a dehydrate function that loads it into a script tag for HTML rendering, all preloaded requests from `APIService` are stored here.

```javascript
import StatePreservationService from './services/StatePreservationService';
import URLPreloadingService from './services/URLPreloadingService';

function renderServer(){
  return {
    component:renderToString((
      <StaticRouter context={window} location={window.location.pathname}>
      <Routes />
      </StaticRouter>
    )),
    state:StatePreservationService.dehydrate
  };
}

if (typeof ISOMORPHIC_WEBPACK === 'undefined') {

	...

}else{

  app = new Promise(function(resolve,reject){
    URLPreloadingService.preloadURL(window.location.pathname).then(function(){

      resolve(renderServer());
    });
  });
}

export default app;
```

This is the entry point for isomorphic-webpack's `evalBundleCode`. You might notice the dehydrate _function_ from `StatePreservationService` this is to work around the restraints in talking from the VM to Server.

```javascript
server.get('*', (req, res) => {
  const requestUrl = req.protocol + '://' + req.get('host') + req.originalUrl;

  const bundle = evalBundleCode(requestUrl).default;

  bundle.then((app) => {
    const body = app.component;
    const state = app.state();
    const helmet = Helmet.renderStatic();

    if (app.get("HTTP_CODE")){
      res.status( app.get("HTTP_CODE") );
    }

    res.send(renderFullPage(body,helmet,state));
  });
});
```
Finally we have the actual express entry for rendering the page, and we call the `renderStatic` function and load it into the `renderFullPage` function that returns an html string from a template.

An important thing to know as well is that the `StatePreservationService` can store more than just AJAX responses, for example the little quote widget on the header randomly picks a quote _in the component_ and stores it for the client render.

Ultimately the solutions to both of these issues are SUPER hacky and are far overbuilt for what they need to do. The need to load in every URL's AJAX calls makes expanding the site difficult and tedious.

### The Second Attempt

When I had finally hacked together the isomorphic-webpack version to a point I found acceptable, I found a talk on [Next.js](https://github.com/zeit/next.js/) which seemed to solve alot of the problems I was having in a much easier way.

For example making an AJAX request from a component goes from:

Having to defining each request by URL, preloading that request, and having the component check if it's waiting on a new AJAX request or getting a preloaded response in the old system.

To this in Next.js:

```javascript
static async getInitialProps(context){
  const { url } = context.query;
  const res = await fetch(`${CONFIG.API_URL}/posts`);
  const resp = await res.json();

  return {
    initialPosts: resp.posts,
    maxPages: resp.pages
  }
}
```

AJAX requests become REALLY easy in Next.js thanks to this. The only issue is that Next.js only preloads data like this for components in the /pages directory meaning that you can't, for example, put this directly onto a blog feed object, the page it's self would have to pass the initial posts to it as props.

Next.js is also _very_ adherent to the React architecture which makes traversing the virtual DOM upwards to relay data to the server difficult.

For example, the quotes component can't randomly pick its own quote anymore since in order to maintain consistency between server and client it would have to pass it's quote outside of the virtual DOM to the server, or somehow directly insert itself into Next's page preload data ( If there's a way to do this I've overlooked please let me know ). Instead of this I had every page pick a random number and pass it down the DOM to the quotes component.

It's still a hack but much more manageable than the previous attempt, plus it adds flavor to the site.

### Closing Thoughts

Honestly, for what it is, I wish I had found Next.js sooner, it prevents a massive amount of headache and confusion when it comes to setting up an Isomorphic React app. I would be afraid to know how much time I've wasted setting up webpack and babel configs just to try and work my way around them to pass the wget test. However, I still think that there is still some benefit to the old model of isomorphic-webpack, or compiling two different webpack builds for server and client just due to the flexibility of how you can set up the render call.

But for quick apps, or if I had to build Digglesby.com again, I would definitely choose Next.js.

#### Thanks for reading!

At the time of writing I haven't added comments yet, but if you want to get in contact me please feel free to [use my form](https://www.digglesby.com/contact-me). Or message me on twitter [@digglesby](https://www.twitter.com/digglesby)
