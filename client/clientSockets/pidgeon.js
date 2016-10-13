//an array of the displayable pidgeons for client side reference
var characterList = [];
//an array of the associations between server id's and client side id's
var characterAssoc={};
export default class Pidgeon extends THREE.Object3D{
  constructor(props){
    super();
    let properties = props || {};
    // console.log("c",properties);
    characterList.push(this);
    if(properties.hasOwnProperty("unique")){
      console.log("new character",properties);
      characterAssoc[properties.unique+""]=this;
    }else{
      console.warn("you created a character without providing server unique. This renders the character unreachable");
    }
  }
  init() {
    this.camera=camera;
    this.socketController=socketController;
    console.log("pidgeon",Pidgeon.geometry);
    this.mesh = new THREE.Mesh(Pidgeon.geometry,Pidgeon.material);
    this.add(this.mesh);
    /*
    pendant: these will become useful later:*/
    let transformReturnFunctions = {
      prevCoords: {x:0,y:0,z:0},
      newCoords: {x:0,y:0,z:0},
      getMovementDirection: function() {
        //pendant: so far these are 2d and using x/y coords.
        var rel = this.getRelativeMovement();
        return Math.atan2(rel.y, rel.x)
      },
      getRelativeMovement: function() {
        //pendant: so far these are 2d and using x/y coords.
        return ({
          x: this.prevCoords.x - this.newCoords.x,
          y: this.prevCoords.y - this.newCoords.y,
          z: this.prevCoords.z - this.newCoords.z
        });
      },
    }
    this.transform = {
      position: function(a) {
        //transfer all the position properties to the mesh position
        //we are trusting that a looks like {x:int,y:int,z:int}
        //we are not requiring all the three corrdinates
        for(let b in a){
          transformReturnFunctions.prevCoords[b]=this.mesh.position[b];
          this.mesh.position[b]=b[a];
          transformReturnFunctions.newCoords[b]=b[a];
        }
        return transformReturnFunctions;
      },
      rotation: function(a) {
        // myDom.style.webkitTransform = 'rotate(' + a + 'deg)';
        // myDom.style.mozTransform = 'rotate(' + a + 'deg)';
        // myDom.style.msTransform = 'rotate(' + a + 'deg)';
        // myDom.style.oTransform = 'rotate(' + a + 'deg)';
        // myDom.style.transform = 'rotate(' + a + 'deg)';
      }
    }

  }
  update(deltaTime){
    // console.log("update"+deltaTime);
    // console.log(camera.position);
    //poll camera
  }

  static initMesh(loadingManager){
    console.log("pidgeon init mesh");
    //initialize graphics, create mesh?
    this.geometry = new THREE.BoxGeometry(10,10,10);
    this.material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
  }
  static each (callback) {
    for (var characterIndex in characterList) {
      var characterInstance = characterList[characterIndex];
      callback(characterInstance, characterIndex);
    }
  }
  //get a character using a unique
  static remote(unique){
    return characterAssoc[unique+""];
  }
}