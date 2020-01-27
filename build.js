const fs = require('fs').promises;
const FileType = require('file-type');
const uuidv4 = require('uuid/v4');
const sharp = require('sharp');

async function readCacheIDMap(){
  try {
    let data = await fs.readFile('./cache_id_map.json', 'utf8');
    return JSON.parse(data);
  } catch (err){
    console.warn(`[WARN]:Unable to load or parse cache_id_map.json:\n${err}`);
    return {};
  }
}

async function writeCacheIDMap( new_map ){
  try {
    await fs.writeFile("cache_id_map.json", JSON.stringify(new_map) );
  } catch (err) {
    console.warn(`[WARN]:Unable to save new cache_id_map.json`);
  }
}

function updateCacheIDMap( map_entry, old_map ){
  let cache_map = {
    ...old_map,
    ...map_entry
  };

  writeCacheIDMap( cache_map );
}

async function getPostDirs(){
  let directories = await fs.readdir('./posts');
  return directories;
}

async function cleanMap( cache_map, dirs ){
  let new_map = {};

  for (post of dirs) {
    new_map[post] = cache_map[post];
  }

  return new_map;
}

async function getMedia( post ){
  let post_media = [];

  try {

    let files = await fs.readdir( `./posts/${post}/media` );

    for (var i = 0; i < files.length; i++) {
      let stats = await fs.lstat(`./posts/${post}/media/${files[i]}`);

      if ( stats.isFile() ){

        post_media.push({
          path: `./posts/${post}/media/${files[i]}`,
          name: files[i],
          type: await FileType.fromFile(`./posts/${post}/media/${files[i]}`),
          size: stats.size
        });

      } else {
        console.warn(`[WARN]: Directory in media for post ${post} this is currently unsupported!`);
      }

    }
  } catch(err) {
    console.error(`[LOG]: Unable to load media for post ${post}`);
  }

  return post_media;
}

async function getMeta( post ){

  try {
    let data = await fs.readFile( `./posts/${post}/meta.json` );
    return JSON.parse(data);
  } catch(err) {
    console.error(`[ERROR]: Unable to load meta for post ${post}\n${err}`);
    throw new Error("Unable to load post meta!");
  }

  return post_media;
}

async function getText( post ){

  try {
    let data = await fs.readFile( `./posts/${post}/post.md` );
    return data.toString();
  } catch(err) {
    console.error(`[ERROR]: Unable to get text for post ${post}\n${err}`);
    throw new Error("Unable to load post text!");
  }

  return post_media;

}

async function resetBin(){
    await fs.rmdir('./bin', { recursive: true });
    await fs.mkdir('./bin');

    return true;
}

async function getPostObject( post ){

  let post_obj = {
    name: post,
    text: await getText( post ),
    meta: await getMeta( post ),
    media: await getMedia( post )
  };

  return post_obj
}

async function scaleImage( input_path, output_path, size, name ){
  let name_parts = name.split(".");
  let new_name = `${name_parts[0]}-${size}w.${name_parts[1]}`;

  let image = await sharp(input_path);
  let metadata = await sharp(input_path).metadata();

  if ((metadata.width > size) || (metadata.height > size)){
    await image.resize(size,size,{fit:'inside'});
  }

  image.toFile(`${output_path}/${new_name}`);

  return true;
}

async function writeManifest( data ){
  await fs.writeFile(`./bin/manifest.json`,JSON.stringify(data));
}

async function writeMedia( objects, dir ){

  for (var i = 0; i < objects.length; i++) {

    if (objects[i].type){
      switch (objects[i].type.mime){
          case 'image/png':
          case 'image/jpeg':
            await fs.copyFile( objects[i].path, `${dir}/${objects[i].name}` );

            await scaleImage(
              objects[i].path,
              `${dir}`,
              1200,
              objects[i].name
            );

            await scaleImage(
              objects[i].path,
              `${dir}`,
              800,
              objects[i].name
            );

            await scaleImage(
              objects[i].path,
              `${dir}`,
              400,
              objects[i].name
            );

            await scaleImage(
              objects[i].path,
              `${dir}`,
              150,
              objects[i].name
            );

            console.log(`[LOG]: Processed image ${objects[i].name}`);
            break;
          default:
            await fs.copyFile( objects[i].path, `${dir}/${objects[i].name}` );
      }

    } else {
      await fs.copyFile( objects[i].path, `${dir}/${objects[i].name}` );
    }

  }
}

async function writePost( post_obj, cache_map, key ){
  await fs.mkdir(`./bin/${cache_map[post_obj.name]}`);
  await fs.writeFile(`./bin/${cache_map[post_obj.name]}/post.json`,JSON.stringify({
    ...post_obj.meta,
    post: post_obj.text,
    key: key
  }));
  await fs.mkdir(`./bin/${cache_map[post_obj.name]}/media`);
  await writeMedia( post_obj.media, `./bin/${cache_map[post_obj.name]}/media` );
}

//Recache_all
//Recache_post
async function run(){
  console.log(process.argv);
  let MODE = "rebuild_new";
  let REBUILD_POST = null;

  switch (process.argv[2]){
    case 'rebuild':
      MODE = "rebuild_all";
      break;
    case 'post':
      MODE = "rebuild_post";
      REBUILD_POST = process.argv[3];
      break;
    default:
      MODE = "rebuild_new";
  }

  let POST_DIRS = await getPostDirs();
  let CACHE_MAP = await readCacheIDMap();

  for (post of POST_DIRS){

    if (MODE == 'rebuild_all') {
      CACHE_MAP[post] = uuidv4();

    } else {
      if (!CACHE_MAP.hasOwnProperty(post)){
        CACHE_MAP[post] = uuidv4();
      }
    }

  }

  if (MODE == "rebuild_post"){
    if (POST_DIRS.indexOf(REBUILD_POST) != -1){
      CACHE_MAP[REBUILD_POST] = uuidv4();
    } else {
      console.error(`[ERROR]: Unable to find directory for "${REBUILD_POST}"`);
      return;
    }
  }

  CACHE_MAP = await cleanMap(CACHE_MAP, POST_DIRS);

  writeCacheIDMap(CACHE_MAP);
  console.log(`[LOG]: Cache map built!`);
  console.log(CACHE_MAP);

  await resetBin();

  let MANIFEST_DATA = [];

  for (var key in CACHE_MAP) {
    let post_data = await getPostObject(key);
    await writePost( post_data, CACHE_MAP, CACHE_MAP[key] );

    MANIFEST_DATA.push({
      key: `${CACHE_MAP[key]}`,
      date: post_data.meta.date,
      title: post_data.meta.name,
      url: post_data.meta.url,
      summary: post_data.meta.summary
    })
  }

  await writeManifest(MANIFEST_DATA);
  console.log(`[LOG]: Build complete!`);

}

run();
