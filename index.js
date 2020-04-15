const VISITED_COOKIE_NAME = "visited"
const VARIANTS_URL = "https://cfw-takehome.developers.workers.dev/api/variants"

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

/**
 * Respond with hello worker text
 * @param {Request} request
 */
async function handleRequest(request) {
  var variant

  // check if site cookie is available
  const cookie = getCookie(request, VISITED_COOKIE_NAME)  
  
  if (cookie) {
    variant = cookie
  } else {

    // send a get response to the variants URL
    const variantRes = await fetch(VARIANTS_URL)
    .then(
      function(response) {
        if (response.status !== 200 ) {
          console.log("Error in fetching variants, Status code : " + response.status)
          return Promise.reject(new Error(response.statusText))
        } 
        
        // successfully fetch variants, return it's json
        return response.json()
      })
    
    // return the variants array
    var variants = variantRes["variants"]

    // pick a random variant
    var index = Math.floor(Math.random() * variants.length)
    variant = variants[index]
  }

  // return the picked variant page as a string
  var response = await fetch(variant)
  .then(response => response.text())

  // contruct the response
  newResponse = new Response(response, {
    "headers": {
      "Content-Type": "text/html",
      "Set-Cookie": VISITED_COOKIE_NAME + "=" + variant + "; SameSite=Strict" + "; Domain=example.com",
    },
    "credentials": "include"
  })

  // The rewritter that will be used in changing values 
  // for html variant response
  var rewritter = new HTMLRewriter()
  .on('a#url', {
    element(element) {
      if (element.hasAttribute("href")){
        element.setAttribute("href", "http://khairulmakirin.website")
      }
      
      element.setInnerContent("Visit my portofolio website")
    }
  })
  .on('p#description', {
    element(element) {
      element.setInnerContent("Hi my name is Khairul Makirin, a student developer from Indonesia. Nice to meet you")
    }
  })
  .on('title', {
    element(element) {
      element.setInnerContent("Khairul Take Home Test")
    }
  })
  .on('h1#title', {
    element(element) {
      if (variant.charAt(variant.length-1) == '1') {
        element.setInnerContent("Wellcome to Variant 1")
      } else if (variant.charAt(variant.length-1) == '2') {
        element.setInnerContent("Hello from Variant 2")
      }
    }
  })
  .on('div[class~=bg-gray-500]', {
    element(element) {
      const divClass = element.getAttribute("class")
      if (variant.charAt(variant.length-1) == '1') {
        element.setAttribute("class", divClass + " bg-purple-200")
      } else if (variant.charAt(variant.length-1) == '2') {
        element.setAttribute("class", divClass + " bg-green-200")
      }
    }
  })

  return rewritter.transform(newResponse)
}

/**
 * Return the cookie value of the specified name
 * @param {Request} request
 * @param {String} name
 * @returns {String}
 */
function getCookie(request, name) {
  let result = null
  let cookieString = request.headers.get('Cookie')

  if (cookieString) {
    let cookies = cookieString.split(';')

    cookies.forEach(cookie => {
      let cookieName = cookie.split('=')[0].trim()
      
      if (cookieName === name) {
        let cookieVal = cookie.split('=')[1]
        result = cookieVal
      }
    })
  }

  return result
}