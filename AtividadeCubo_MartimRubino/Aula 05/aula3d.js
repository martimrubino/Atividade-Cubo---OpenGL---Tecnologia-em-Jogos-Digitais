var	vertexShaderSource,
	fragmentShaderSource,
	vertexShader,
	fragmentShader,
	shaderProgram,
	positionAttr,
	luzUniform,
	luz,
	canvas,
	gl,
	buffer,
	data,
	camera;

/* MATRIZES */
var projection,
	projectionUniform,
	view,
	viewUniform,
	model,
	modelUniform;


//Sistema de arquivos
window.addEventListener("SHADERS_LOADED", main);
loadFile("vertex.glsl","VERTEX",loadShader);
loadFile("fragment.glsl","FRAGMENT",loadShader);
function loadFile(filename, type, callback){
	var xhr = new XMLHttpRequest();
	xhr.open("GET",filename,true);
	xhr.onload = function(){callback(xhr.responseText,type)};
	xhr.send();
}

function getGLContext(){
	canvas = document.getElementById("canvas");
	gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	//gl.viewport(0, 0, canvas.width, canvas.height);
}

function loadShader(text,type){
	if(type == "VERTEX") vertexShaderSource = text;
	if(type == "FRAGMENT") fragmentShaderSource = text;
	if(vertexShaderSource && fragmentShaderSource) window.dispatchEvent(new Event("SHADERS_LOADED"));
}

function compileShader(source,type){
	shader = gl.createShader(type);
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) console.log(gl.getShaderInfoLog(shader));
	return shader;
}

function linkProgram(vertexShader,fragmentShader){
	var program	= gl.createProgram();
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) console.log("Error: Program Linking.");
	return program;
}

function getData(){
	var points = [	
					//frente
					0.9, 0.9, 0.9,
					0.9, -0.9, 0.9,
					-0.9, -0.9, 0.9,
					
					-0.9, -0.9, 0.9,
					-0.9, 0.9, 0.9,
					0.9,  0.9, 0.9,
					
					//cima
					-0.9, 0.9, 0.9,
					-0.9, 0.9, -0.9,
					0.9, 0.9, -0.9,
					
					0.9, 0.9, 0.9,
					-0.9, 0.9, 0.9,
					0.9, 0.9, -0.9,
					
					//traz
					0.9, 0.9, -0.9,
					0.9, -0.9, -0.9,
					-0.9, -0.9, -0.9,
					
					-0.9, -0.9, -0.9,
					0.9, 0.9, -0.9,
					0.9, 0.9, -0.9,
					
					//baixo
					-0.9, -0.9, 0.9,
					-0.9, -0.9, -0.9,
					0.9, -0.9, -0.9,
					
					0.9, -0.9, 0.9,
					-0.9, -0.9, 0.9,
					0.9, -0.9, -0.9,
					
					//esquerda
					-0.9, 0.9, -0.9,
					-0.9, 0.9, 0.9,
					-0.9, -0.9, 0.9,
					
					-0.9, 0.9, -0.9,
					-0.9, -0.9, -0.9,
					-0.9, -0.9, 0.9,
					
					//direita
					0.9, 0.9, -0.9,
					0.9, 0.9, 0.9,
					0.9, -0.9, 0.9,
					
					0.9, 0.9, -0.9,
					0.9, -0.9, -0.9,
					0.9, -0.9, 0.9
				];
	return {"points": new Float32Array(points)};
}

function main() {
	/* LOAD GL */
	getGLContext();

	/* COMPILE AND LINK */
	vertexShader = compileShader(vertexShaderSource, gl.VERTEX_SHADER);
	fragmentShader = compileShader(fragmentShaderSource, gl.FRAGMENT_SHADER);
	shaderProgram = linkProgram(vertexShader,fragmentShader);
	gl.useProgram(shaderProgram);

	/* PARAMETERS */
	data = getData();
	positionAttr = gl.getAttribLocation(shaderProgram, "position");
	buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data.points, gl.STATIC_DRAW);
	gl.enableVertexAttribArray(positionAttr);
	gl.vertexAttribPointer(positionAttr, 3, gl.FLOAT, false, 0, 0);

	/* UNIFORM */
	luzUniform = gl.getUniformLocation(shaderProgram,"luz");
	luz = new Float32Array([0.5,0.9]);
	gl.uniform2fv(luzUniform, luz);

	projectionUniform = gl.getUniformLocation(shaderProgram,"projection");

	viewUniform = gl.getUniformLocation(shaderProgram,"view");

	modelUniform = gl.getUniformLocation(shaderProgram,"model");


	projection = mat4.perspective([],Math.PI/4, window.innerWidth/window.innerHeight, 0.1, 1000);

	camera = [0,0,10];

	view = mat4.lookAt([],camera,[0,0,0],[0,1,0]);

	model = [
			1,0,0,0,
			0,1,0,0,
			0,0,1,0,
			0,0,0,1
	];

	gl.uniformMatrix4fv(projectionUniform,gl.FALSE,new Float32Array(projection));

	gl.uniformMatrix4fv(viewUniform,gl.FALSE,new Float32Array(view));

	gl.uniformMatrix4fv(modelUniform,gl.FALSE,new Float32Array(model));

	/* DRAW */
	//gl.lineWidth(5.0);
	//gl.POINTS, gl.LINES, gl.LINE_STRIP, gl.LINE_LOOP, gl.TRIANGLES
	resize();
	animate();

}

function animate(){
	gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
	gl.drawArrays(gl.TRIANGLES, 0, data.points.length/3);
	window.requestAnimationFrame(animate);
}

function resize(){
	var w  = window.innerWidth;
	var h  = window.innerHeight;
	aspecto = w/h;
	//gl.uniformMatrix4fv
	projection = mat4.perspective([],Math.PI/4, aspecto, 0.1, 1000);

	gl.uniformMatrix4fv(projectionUniform,gl.FALSE,new Float32Array(projection));
	canvas.setAttribute("width",w);
	canvas.setAttribute("height",h);
	gl.viewport(0, 0, w, h);
}

function moveCamera(evt){
	var y = (evt.y / window.innerHeight) * 20 -10;
	var x = (evt.x / window.innerWidth) * 20 -10;
	camera = [x,-y,10];
	view = mat4.lookAt([],camera,[0,0,0],[0,1,0]);

	//camera = [x,-y,0];
	//view = mat4.lookAt([],[0,0,10],camera,[0,1,0]);

	gl.uniformMatrix4fv(viewUniform,gl.FALSE,new Float32Array(view));
}

window.addEventListener("resize",resize);
window.addEventListener("mousemove",moveCamera);
