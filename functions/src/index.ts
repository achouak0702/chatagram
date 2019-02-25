import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'
import fetch from 'node-fetch'

admin.initializeApp(functions.config().firebase)

// Start writing Firebase Functions
// https://firebase.google.com/docs/functions/typescript
export const onWriteMessages = functions.firestore
    .document('users/{id}')
    .onWrite(async(change, context) => {
        // Get an object with the current document value.
        // If the document does not exist, it has been deleted.
        const user = change.after.exists ? change.after.data() : null;
  
        // Get an object with the previous document value (for update or delete)
        const oldUser= change.before.data();
  
        // perform desired operations ...
        console.log("message = ", user)
        console.log("old message= ", oldUser)
        //choices: user logged in user logged out user registred
        let message = null
        if(!oldUser || user.online && !oldUser.online){
            message = "HI"
        }else if(oldUser.online && !user.online  ){
            message = "bye"

        }
        if(message){
             await admin.firestore().collection("messages").add({ username: "bot.png", message: message + " "+user.name + " !", time: new Date() })
        }
      });

export const greetingMessage = functions.https.onCall(async (data, context) => {
    const message = data.message
    const email = context.auth.token.email || null
    console.log("Success!!!!", message)
    
   
    

    const sayBot = async (message) => {
        return await admin.firestore().collection("messages").add({ username: "Bot.png", message, time: new Date() })
    }
    const querySnapshot = await admin.firestore().collection("users").where("id","==",email).get()
    if (message === "!greet") {
    
        
        querySnapshot.forEach(async doc => {
            const status = doc.data().online
            if (status == true) {
                return await sayBot("Hi " + email)
            }else{
                return await sayBot("BYE " + email)
            }
        })
    

    }

})

export const addMessage = functions.https.onCall(async (data, context) => {
    const message = data.message
    const email = context.auth.token.email || null
    
    console.log("Success!!!!", message)
    await admin.firestore().collection("messages").add({ username: "Bot.png", message, time: new Date() })

    const sayUser = async () =>
        await admin.firestore().collection("messages").add({ username: email, message, time: new Date() })

    const sayBot = async (message) => {
        await sayUser()
        return await admin.firestore().collection("messages").add({ username: "Bot.png", message, time: new Date() })
    }

    if (message === "!help") {
        return await sayBot("Commands are !hi, !users, and !weather <city>")
    } else if (message === "!hi") {
        return await sayBot("Hi to " + email)
    } else if (message === "!users") {
        const querySnapshot = await admin.firestore().collection("messages").get()
        
        const users = new Array()
         
        querySnapshot.forEach(async doc => {
            
            const username = doc.data().username
            
            if (!users.includes(username)) {
                users.push(username)
            }
        })
        return await sayBot(users.join(", "))
    } else if (message.startsWith("!weather ")) {
        const city = message.slice(9)
        console.log(city)
        // https://api.openweathermap.org/data/2.5/weather?q=London,uk&appid=b6907d289e10d714a6e88b30761fae22
        // do a fetch or request, await the json result, make a message
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=b6907d289e10d714a6e88b30761fae22`)
        const json = await response.json()
        console.log(json)
        const description = json.weather[0].main
        const temp = json.main.temp - 273.15
        return await sayBot(`Currently ${description} and ${temp} degrees`)
    }
    return await sayUser()
})

export const updateImage = functions.https.onRequest(async (req, res) => {
    // find all images (users with captions)
    const querySnapshot = await admin.firestore().collection("users").where("caption", ">", "").get()
    const emails = new Array()
    querySnapshot.forEach(doc =>
        emails.push(doc.id)
    )
    console.log("emails", emails.length)

    // pick one at random
    const email = emails[Math.floor(emails.length * Math.random())]
    console.log("email", email)

    // change user document in image collection
    await admin.firestore().collection("image").doc("user").update({ email: email })

    res.status(200).send();
})
