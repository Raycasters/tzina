import Sky from './sky'
import Square from './square'
import CollisionManager from './collision_manager'
import Character from './character'
import KeyboardController from './keyboard_controller'
import PostShader from './post_shader'
import Flood from './flood'

export default class Game {
    constructor(config) {
        console.log("Game constructed!")
        this.config = config;
    }
    init() {
        this.renderer = new THREE.WebGLRenderer({antialias: true});
        this.renderer.setClearColor( 0, 1 );
        this.renderer.setPixelRatio(window.devicePixelRatio);
        //this.renderer.setClearColor( 0x000000, 1 );

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75,window.innerWidth / window.innerHeight, 1, 2000000);

        this.scene.add(this.camera);
        this.clock = new THREE.Clock();

        //this.camera.rotation.x = 0.22;


        //let helper = new THREE.GridHelper( 5000, 5000, 0xffffff, 0xffffff );
        //this.scene.add( helper );
        //

        // LIGHT
        this.hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.05 );
        this.hemiLight.color.setHSL( 0.6, 1, 0.6 );
        this.hemiLight.groundColor.setHSL( 0.095, 1, 0.75 );
        this.hemiLight.position.set( 0, 500, 0 );
        this.scene.add( this.hemiLight );
        
        this.dirLight = new THREE.DirectionalLight(0xFFFFFF, 1);
        this.dirLight.position.set( 0, 120, -200  );
        this.dirLight.color.setHSL( 0.1, 1, 0.95 );
        //dirLight.target.position.set(0,100,0);
        //
        //
        /*
        this.dirLight.shadow.camera.far = 3500;
        this.dirLight.shadow.bias = -0.000001;*/
        this.scene.add(this.dirLight);

        this.loadingManager = new THREE.LoadingManager();
        this.collisionManager = new CollisionManager(this.camera);


        // Square
        this.square = new Square();

        // Test character
        this.testCharacter = new Character({
            basePath : 'assets/characters/take_1',
            mindepth : 404.999969482,
            maxdepth : 1111.719970703,
            position : [-496, 29, 157],
            rotation: [0, 40, 0],
            name: 'test'
        });


        this.sky = new Sky(this.loadingManager);

        this.flood = new Flood();
        this.flood.init();
        this.scene.add(this.flood);

        // Post processing
        this.composer = new THREE.EffectComposer(this.renderer);
        let renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);

        let effect = new THREE.ShaderPass(PostShader);
        effect.renderToScreen = true;
        this.composer.addPass( effect );



    }

    load(onLoad) {
        this.loadingManager.onLoad = () => {

            console.log("Done loading everything!");
            this.scene.add(this.sky.mesh);

            onLoad();
        };
        this.loadingManager.onError = (err) => {
            console.log("Error during load", err);
        };

        this.loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
            
            console.log("Loaded ", url, "(" + itemsLoaded + "/" +  itemsTotal + ")");
        }

        //this.square.init(this.scene, this.collisionManager, this.loadingManager);
        this.sky.init();
        this.testCharacter.init(this.scene, this.loadingManager)



    }

    start() {
        let element = this.renderer.domElement;
        this.container = document.getElementById('game');
        this.container.appendChild(element);
        // WebVR
        let vrControls = new THREE.VRControls(this.camera);
        vrControls.standing = true;

        let vrEffect = new THREE.VREffect(this.renderer);
        vrEffect.setSize(window.innerWidth, window.innerHeight);

        let params = {
          hideButton: false, // Default: false.
          isUndistorted: false // Default: false.
        };
        var manager = new WebVRManager(this.renderer, vrEffect, params);
        if (this.config.controls == "locked") {
            let controls = new THREE.PointerLockControls( this.camera );
            this.scene.add( controls.getObject() );
            controls.enabled = true;

            this.keyboardController = new KeyboardController(controls, this.square, this.collisionManager)
            this.keyboardController.init();

            this.collisionManager.setPlayer(controls.getObject());

            // Get in the square
            //this.keyboardController.setPosition(-475, 30, 183);

        } else {
            this.controls = new THREE.OrbitControls( this.camera, element );
        }
        this.resize();

        //this.testCharacter.play();

    }

    animate(t) {
      this.update(this.clock.getDelta());
      this.render(this.clock.getDelta());
    }

    update(dt) {
        this.collisionManager.update(dt);
        this.sky.update(dt);
        this.dirLight.position.copy(this.sky.getSunPosition());
        this.square.update(dt);
        this.flood.update(dt);
        this.testCharacter.update(dt);
        if (this.keyboardController) {
            this.keyboardController.update(dt);
        }
        //console.log(this.camera.rotation);
    }

    render(dt) {
        // this.composer.render(); // For post processing
        this.renderer.render(this.scene, this.camera);
    }

    resize() {
        let width = this.container.offsetWidth;
        let height = this.container.offsetHeight;
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
        this.composer.setSize(width, height);
    }
}
