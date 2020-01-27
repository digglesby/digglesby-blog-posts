
[Local link](media/example.json)

[Github](https://www.github.com/)

Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Consequat interdum varius sit amet. Vitae turpis massa sed elementum tempus. Imperdiet sed euismod nisi porta lorem mollis aliquam ut. Ac odio tempor orci dapibus ultrices. Luctus venenatis lectus magna fringilla urna porttitor rhoncus. Lorem mollis aliquam ut porttitor leo a diam sollicitudin tempor. Scelerisque viverra mauris in aliquam sem. Senectus et netus et malesuada fames ac turpis egestas sed. Mi in nulla posuere sollicitudin aliquam ultrices.

![Haamyu's profile picture was the first one I saw for testing images.](media/test.jpg)

Semper feugiat nibh sed pulvinar proin. Praesent elementum facilisis leo vel fringilla est ullamcorper eget nulla. Justo donec enim diam vulputate ut pharetra sit amet. Eget magna fermentum iaculis eu non diam phasellus vestibulum. Turpis egestas maecenas pharetra convallis posuere morbi leo urna. Mauris augue neque gravida in fermentum et. Cras semper auctor neque vitae. Pellentesque adipiscing commodo elit at imperdiet dui accumsan sit amet. Ullamcorper a lacus vestibulum sed arcu non. Nunc eget lorem dolor sed viverra ipsum nunc aliquet. Nibh nisl condimentum id venenatis a. Viverra mauris in aliquam sem fringilla ut morbi tincidunt augue. Et netus et malesuada fames ac turpis. Fusce id velit ut tortor pretium viverra suspendisse potenti. Diam sit amet nisl suscipit adipiscing bibendum est. Tristique senectus et netus et malesuada fames. Accumsan in nisl nisi scelerisque eu ultrices vitae.

![Steve's profile pic](https://avatars0.githubusercontent.com/u/6619205?s=400&v=4)

Integer malesuada nunc vel risus commodo viverra maecenas accumsan. Urna id volutpat lacus laoreet. Libero id faucibus nisl tincidunt eget nullam non. Nunc sed blandit libero volutpat. Non consectetur a erat nam at. Aliquam eleifend mi in nulla posuere sollicitudin aliquam ultrices. Sagittis orci a scelerisque purus. Aliquam ultrices sagittis orci a. Pretium viverra suspendisse potenti nullam ac tortor vitae. Mauris cursus mattis molestie a. Ullamcorper a lacus vestibulum sed arcu non odio. Neque gravida in fermentum et sollicitudin ac orci phasellus. Tempus egestas sed sed risus pretium quam vulputate. Varius quam quisque id diam vel quam elementum.

Pellentesque massa placerat duis ultricies lacus sed turpis tincidunt. Enim tortor at auctor urna nunc. Nec feugiat nisl pretium fusce id velit ut. Varius quam quisque id diam vel quam elementum pulvinar etiam. Vitae elementum curabitur vitae nunc sed velit dignissim. Libero id faucibus nisl tincidunt. Diam maecenas ultricies mi eget mauris pharetra. Aliquam id diam maecenas ultricies mi eget mauris pharetra. Porttitor eget dolor morbi non arcu risus quis varius. Sagittis purus sit amet volutpat consequat mauris nunc congue. Aliquam faucibus purus in massa tempor nec. Consequat ac felis donec et odio pellentesque.

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

Ultrices tincidunt arcu non sodales neque. Sapien et ligula ullamcorper malesuada proin. Sodales ut etiam sit amet nisl purus in mollis nunc. Vulputate eu scelerisque felis imperdiet proin. Nulla porttitor massa id neque aliquam vestibulum. Ac auctor augue mauris augue neque gravida in fermentum. Dolor sit amet consectetur adipiscing. Pellentesque diam volutpat commodo sed. Vulputate eu scelerisque felis imperdiet proin fermentum leo. Risus at ultrices mi tempus imperdiet nulla malesuada.
