
var Colors = {
	cherry: 0xe35d6a,
	blue: 0x1560bd,
	white: 0xd8d0d1,
	black: 0x000000,
	skinny: 0xe5cec0,
	peach: 0xffdab9,
	yellow: 0xffff00,
	olive: 0x556b2f,
	
};

var deg2Rad = Math.PI / 180;

window.addEventListener('load', function(){
	new World(document.getElementById('world'));
});


function sinusoid(frequency, minimum, maximum, phase) {
	var amplitude = 0.5 * (maximum - minimum);
	var angularFrequency = 2 * Math.PI * frequency;
	var phaseRadians = phase * Math.PI / 180;
	var currTimeInSecs = new Date() / 1000;
	var offset = amplitude * Math.sin(
		angularFrequency * currTimeInSecs + phaseRadians);
	var average = (minimum + maximum) / 2;
	return average + offset;
}


function createGroup(x, y, z) {
	var group = new THREE.Group();
	group.position.set(x, y, z);
	return group;
}

function createBox(dx, dy, dz, color, x, y, z, notFlatShading) {
    var geom = new THREE.BoxGeometry(dx, dy, dz);
    var mat = new THREE.MeshPhongMaterial({
		color:color, 
    	flatShading: notFlatShading != true
    });
    var box = new THREE.Mesh(geom, mat);
    box.castShadow = true;
    box.receiveShadow = false;
    box.position.set(x, y, z);
    return box;
}


function Character() {

	var self = this;
	this.skinColor = Colors.skinny;
	this.hairColor = Colors.black;
	this.shirtColor = Colors.yellow;
	this.shortsColor = Colors.olive;
	this.stepFreq = 2;

	init();


	function init() {

		self.face = createBox(100, 100, 60, self.skinColor, 0, 0, 0);
		self.hair = createBox(105, 20, 65, self.hairColor, 0, 50, 0);
		self.head = createGroup(0, 260, -25);
		self.head.add(self.face);
		self.head.add(self.hair);

		self.torso = createBox(150, 190, 40, self.shirtColor, 0, 100, 0);

		self.leftLowerArm = createLimb(20, 120, 30, self.skinColor, 0, -170, 0);
		self.leftArm = createLimb(30, 140, 40, self.skinColor, -100, 190, -10);
		self.leftArm.add(self.leftLowerArm);

		self.rightLowerArm = createLimb(20, 120, 30, self.skinColor, 0, -170, 0);
		self.rightArm = createLimb(30, 140, 40, self.skinColor, 100, 190, -10);
		self.rightArm.add(self.rightLowerArm);

		self.leftLowerLeg = createLimb(40, 200, 40, self.skinColor, 0, -200, 0);
		self.leftLeg = createLimb(50, 170, 50, self.shortsColor, -50, -10, 30);
		self.leftLeg.add(self.leftLowerLeg);

		self.rightLowerLeg = createLimb(40, 200, 40, self.skinColor, 0, -200, 0);
		self.rightLeg = createLimb(50, 170, 50, self.shortsColor, 50, -10, 30);
		self.rightLeg.add(self.rightLowerLeg);

		self.element = createGroup(0, 0, -300);
		self.element.add(self.head);
		self.element.add(self.torso);
		self.element.add(self.leftArm);
		self.element.add(self.rightArm);
		self.element.add(self.leftLeg);
		self.element.add(self.rightLeg);

	}

	
	function createLimb(dx, dy, dz, color, x, y, z) {
	    var limb = createGroup(x, y, z);
	    var offset = -1 * (Math.max(dx, dz) / 2 + dy / 2);
		var limbBox = createBox(dx, dy, dz, color, 0, offset, 0);
		limb.add(limbBox);
		return limb;
	}
	
	
	this.update = function() {
		self.element.rotation.y += 0.02;
		self.element.position.y = sinusoid(2 * self.stepFreq, 0, 20, 0);
		self.head.rotation.x = sinusoid(2 * self.stepFreq, -10, -5, 0) * deg2Rad;
		self.torso.rotation.x = sinusoid(2 * self.stepFreq, -10, -5, 180) * deg2Rad;
		self.leftArm.rotation.x = sinusoid(self.stepFreq, -70, 50, 180) * deg2Rad;
		self.rightArm.rotation.x = sinusoid(self.stepFreq, -70, 50, 0) * deg2Rad;
		self.leftLowerArm.rotation.x = sinusoid(self.stepFreq, 70, 140, 180) * deg2Rad;
		self.rightLowerArm.rotation.x = sinusoid(self.stepFreq, 70, 140, 0) * deg2Rad;
		self.leftLeg.rotation.x = sinusoid(self.stepFreq, -20, 80, 0) * deg2Rad;
		self.rightLeg.rotation.x = sinusoid(self.stepFreq, -20, 80, 180) * deg2Rad;
		self.leftLowerLeg.rotation.x = sinusoid(self.stepFreq, -130, 5, 240) * deg2Rad;
		self.rightLowerLeg.rotation.x = sinusoid(self.stepFreq, -130, 5, 60) * deg2Rad;
	}

}


function World(element) {

	var self = this;

	var scene, camera, character, renderer, light, shadowLight;

	init();
	
	function init() {

		renderer = new THREE.WebGLRenderer({
			alpha: true,
			antialias: true
		});
		renderer.setSize(window.innerWidth, window.innerHeight);
		renderer.shadowMap.enabled = true;
		element.appendChild(renderer.domElement);

		scene = new THREE.Scene();
		scene.fog = new THREE.Fog(0x363d3d, -1, 3000);

		
		light = new THREE.HemisphereLight(0xffffff, 0xffffff, 0.9);
		shadowLight = new THREE.DirectionalLight(0xffffff, 0.9);
		shadowLight.position.set(200, 200, 200);
		shadowLight.castShadow = true;
		scene.add(light);
		scene.add(shadowLight);

	
		camera = new THREE.PerspectiveCamera(
			60, window.innerWidth / window.innerHeight, 1, 2000);
		camera.position.set(0, 400, 800);
		camera.lookAt(new THREE.Vector3(0, 150, 0));
		window.camera = camera;

		window.addEventListener('resize', handleWindowResize, false);

		character = new Character();
		scene.add(character.element);

		loop();
		
	}
	
	
	function loop() {
		character.update();
		renderer.render(scene, camera);
		requestAnimationFrame(loop);
	}

	
	function handleWindowResize() {
		renderer.setSize(window.innerWidth, window.innerHeight);
		camera.aspect = window.innerWidth / window.innerHeight;
		camera.updateProjectionMatrix();
	}
	
}
