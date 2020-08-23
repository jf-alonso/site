function archiveNavigation() {
    // set up our WebGL context and append the canvas to our wrapper
    var webGLCurtain = new Curtains({
        container: "canvas"
    });

    webGLCurtain.onError(function() {
        // we will add a class to the document body to display original images
        document.body.classList.add("no-curtains", "planes-loaded");
    }).onContextLost(function() {
        // on context lost, try to restore the context
        webGLCurtain.restoreContext();
    });

    // we will keep track of all our planes in an array
    var planes = [];
    var planeElements = [];

    var vs = `
        precision mediump float;

        // default mandatory variables
        attribute vec3 aVertexPosition;
        attribute vec2 aTextureCoord;

        uniform mat4 uMVMatrix;
        uniform mat4 uPMatrix;

        // texture matrix
        uniform mat4 uTextureMatrix0;

        // custom variables
        varying vec3 vVertexPosition;
        varying vec2 vTextureCoord;

        uniform float uTime;

        void main() {
            vec3 vertexPosition = aVertexPosition;

            float distanceFromCenter = distance(vec2(vertexPosition.x, vertexPosition.y), vec2(0.25, vertexPosition.x));
            vertexPosition.z += 0.05 * cos(5.0 * (distanceFromCenter - (uTime / 100.0)));

            // set positions
            gl_Position = uPMatrix * uMVMatrix * vec4(vertexPosition, 1.0);

            // varyings
            vTextureCoord = (uTextureMatrix0 * vec4(aTextureCoord, 0.0, 0.25)).xy;
            vVertexPosition = vertexPosition;
        }
    `;

    var fs = `
        precision mediump float;

        varying vec3 vVertexPosition;
        varying vec2 vTextureCoord;

        uniform sampler2D uSampler0;

        void main( void ) {
            // our texture
            vec4 finalColor = texture2D(uSampler0, vTextureCoord);

            gl_FragColor = finalColor;
        }
    `;

    // all planes will have the same parameters
    var params = {
        vertexShader: vs, // our vertex shader
        fragmentShader: fs, // our framgent shader
        widthSegments: 10,
        heightSegments: 20,
        uniforms: {
            time: {
                name: "uTime", // uniform name that will be passed to our shaders
                type: "1f", // this means our uniform is a float
                value: 0,
            },
        }
    };


    // handle all the planes
    function handlePlanes(index) {
        var plane = planes[index];
        plane && plane.onReady(function() {

            if(index == planeElements.length - 1) {
                console.log("all planes are ready");
            }

        }).onRender(function() {
            // increment our time uniform
            plane.uniforms.time.value++;
        });
    }


    function addPlanes() {
        planeElements = document.getElementsByClassName("plane");

        // if we got planes to add
        if(planeElements.length > 0) {

            for(var i = 0; i < planeElements.length; i++) {
                // add the plane to our array
                var plane = webGLCurtain.addPlane(planeElements[i], params)
                // only push the plane if it exists
                if(plane) planes.push(plane);

                handlePlanes(i);
            }
        }
    }

    function removePlanes() {
        // remove all planes
        for(var i = 0; i < planes.length; i++) {
            webGLCurtain.removePlane(planes[i]);
        }

        // reset our arrays
        planes = [];
    }

    addPlanes();


    // a flag to know if we are currently in a transition between pages
    var isTransitioning = false;

    handleNavigation();
}



window.addEventListener("load", function() {
    archiveNavigation();
});
