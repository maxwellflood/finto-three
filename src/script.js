import './style.css'
import { Scene, PerspectiveCamera, PointLight, WebGLRenderer, BasicShadowMap, TextureLoader, MeshLambertMaterial, MeshPhongMaterial } from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import { gsap, Expo } from 'gsap'

class Card {
	constructor(options) {
		
	this.$canvas = options.$canvas;
		this.$buttons = options.$buttons;// set stuffs
		this.$cardNameColors = options.$cardNameColors;
		// this.$cardNameColor = options.$cardNameColor;
		
    const { innerWidth: width, innerHeight: height } = window


    this.scene = new Scene()

    this.camera = new PerspectiveCamera(45, width / height, 0.1, 1000)
    this.camera.position.set(0, 0, 6)
    this.camera

    this.renderer = new WebGLRenderer({
      canvas: this.$canvas,
      antialias: true
    })

    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = BasicShadowMap

    this.light = new PointLight(0xFFFFFF, 2, 1000)
    this.light.position.set(2, 6, 4)
    this.light.castShadow = true
    this.light.shadow.mapSize.width = 4096
    this.light.shadow.mapSize.height = 4096
    this.light.shadow.camera.near = 0.5
    this.light.shadow.camera.far = 20
    this.scene.add(this.light)

    // mouse movement
    this.cursor = {
      x:0,
      y:0
    }

    window.addEventListener('mousemove', this.onMouseMove.bind(this))

    // create loaders
    const textureLoader = new TextureLoader()

    const dracoLoader = new DRACOLoader()
    dracoLoader.setDecoderPath('draco/')

    const gltfLoader = new GLTFLoader()
    gltfLoader.setDRACOLoader(dracoLoader)

    // init everything
    this.loadScene(gltfLoader, textureLoader)
    this.loadCardTextures(textureLoader)
    this.loadCard(gltfLoader)

    this.activeButton = 0

    // event listeners
    window.addEventListener('resize', this.onResize.bind(this))

    this.$buttons.forEach(($button, i) => {
      // we bind i to the callback, i is the index
		// so, button 1 = 0, 2 = 1, and so on.
		$button.addEventListener('click', this.onButtonClick.bind(this, i))
    })


    // prepare and start the loop
    this.render = this.render.bind(this)
    window.requestAnimationFrame(this.render)
  }

  onMouseMove(e) {
    this.cursor.x = e.clientX / window.innerWidth - 0.5
    this.cursor.y = -(e.clientY / window.innerWidth - 0.5)
  }

  loadScene(gltfLoader, textureLoader) {
    const bakedBgTexture = textureLoader.load('bg_dark_2.jpg')
    bakedBgTexture.flipY = false

    const bakedBgMaterial = new MeshLambertMaterial({
      map: bakedBgTexture,
    })

    gltfLoader.load('finto_bg_dark_v1.4.glb', gltf =>{
      // Create variables
      const backgroundMesh = gltf.scene.children.find((child)=> child.name === 'Background_Dark')
      const plinthMesh = gltf.scene.children.find((child)=> child.name === 'Plinth_Dark')

      // Add textures
      gltf.scene.traverse((child) => {
        child.material = bakedBgMaterial
      })

      plinthMesh.castShadow = false;
      plinthMesh.receiveShadow = true;

      this.scene.add(gltf.scene)
    })
  }
  
  loadCardTextures(textureLoader) {
    this.cardsTextures =  [
      'tex_test_grad_v1+chip.jpg',
      'tex_test_grad_v2+chip.jpg',
      'tex_test_grad_v3+chip.jpg',
      'tex_test_grad_v4+chip.jpg'
    ].map(name => {
      const texture = textureLoader.load(name)
      texture.flipY = false

      return texture
    })
  }

  loadCard(gltfLoader, textureLoader) {
    this.bakedCardMaterial = new MeshLambertMaterial({
      map: this.cardsTextures[0],
      reflectivity: 1,
      specular: 0xFFFFFF
    })

    const white = 0xFFFFFF
    const offWhite = 0xF8F8F8
    
	  const grey = 0xACAEB4

    this.cardColorMaterial = new MeshPhongMaterial({color: this.$cardNameColors[1]})
    // const bgMaterial = new MeshLambertMaterial({color: offWhite})
    const whiteMaterial = new MeshPhongMaterial({color: white})

    const silverMaterial = new MeshPhongMaterial({
      color: grey,
      shininess: 100,
      specular: 0xFFFFFF
    })

    gltfLoader.load('finto_three_v1.5.2.glb', card => {
      const cardRHSMesh = card.scene.children.find((child)=> child.name === 'RHS')
      const cardLHSMesh = card.scene.children.find((child)=> child.name === 'LHS')
      const cardTypeMesh = card.scene.children.find((child)=> child.name === 'Card_Type')
      const nameMesh = card.scene.children.find((child)=> child.name === 'Carholder_Name')
      const logoMesh = card.scene.children.find((child)=> child.name === 'Finto_Logo')
      const visaLogoMesh = card.scene.children.find((child)=> child.name === 'Visa_Logo')
      const chipMesh = card.scene.children.find((child)=> child.name === 'Chip')

      console.log(card)

      card.scene.traverse((child) => {
        child.material = this.bakedCardMaterial
      })

      cardTypeMesh.material = this.cardColorMaterial
      nameMesh.material = whiteMaterial
      logoMesh.material = whiteMaterial
      visaLogoMesh.material = this.bakedCardMaterial
      chipMesh.material = this.bakedCardMaterial

      cardRHSMesh.castShadow= true
      cardRHSMesh.recieveShadow= false
      cardLHSMesh.castShadow= true
      cardLHSMesh.receiveShadow= false

      this.scene.add(card.scene)
      this.card = card.scene
    })
  }

  onResize() {
    const { innerWidth: width, innerHeight: height } = window

    this.camera.aspect = width / height
    this.camera.updateProjectionMatrix()
    
    this.renderer.setSize(width, height)
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  }
	
	onButtonClick(i) {
		this.updateCard(i);
		this.updateButtons();
  }
	
  updateCard(i) {
    // is the card ready?
    if (!this.card || this.activeButton === i) {
      return
    }

    this.activeButton = i

	  this.cardColorMaterial.color.set(this.$cardNameColors[i]); // here you can update the color on the material
    
    // rotate the card
    gsap.fromTo(this.card.rotation, { y: 0 }, {
      duration: 1,
      ease: Expo.easeOut,
      y: Math.PI * 2
    })

    // we need to keep track of the delayed call to update the texture
    // if the user clicks on two buttons fast, only to execute the latest
    if (this.setTextureCallback) {
      this.setTextureCallback.kill()
    }

    this.setTextureCallback = gsap.delayedCall(0.2, () => {
      this.bakedCardMaterial.map = this.cardsTextures[i]
      this.setTextureCallback = null
    })
  }
	
   updateButtons() {
	   this.$buttons.forEach(($button, i) => {
		   if (i == this.activeButton) {
			   $button.classList.add('selected')
		   } else {
			   $button.classList.remove('selected')
           }
       });
   }

  render() {
    window.requestAnimationFrame(this.render)

    // this.controls.update()
    this.camera.position.x = this.cursor.x 
    this.camera.position.y = this.cursor.y / 2
    this.camera.lookAt(this.card.position)
    this.renderer.render(this.scene, this.camera)
  }
}

// pass options here
const $cardNameColors = [0xd46693, 0xEE3E9C, 0xFF8C60, 0x83bec6]
	
new Card({
  $canvas: document.querySelector('canvas.webgl'),
  $buttons: document.querySelectorAll('.circle'),
  $cardNameColors,
})
