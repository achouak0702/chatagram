import React from 'react';
import { Image, Button, TextInput, Text, View, ScrollView, StyleSheet } from 'react-native';
import firebase from 'firebase'
import functions from 'firebase/functions'
import db from '../db.js'
export default class UsersScreen extends React.Component {
  static navigationOptions = {
    title: 'Chat',
  };

  state = {
    messages: [],
    messages1: [],
    message: "",
    imageEmail: null
  }

  users = []

  send = async () => {
    const addMessage = firebase.functions().httpsCallable('addMessage')

    const result = await addMessage({ message: this.state.message })
    this.setState({ message: "" })
  }

  updateImage = async () => {
    await firebase.functions().httpsCallable('updateImage')()
  }

  componentDidMount() {
    // go to db and get all the users
    db.collection("users").where("online", "==", true)
      .onSnapshot(querySnapshot => {
        this.users = []
        querySnapshot.forEach(doc => {
            if (doc.data().public == true){
                this.users.push({ id: doc.id, ...doc.data() })
            }
        })
        console.log("Current users: ", this.users.length)
      })

    // go to db and get all the records
    db.collection("messages")
      .orderBy("time")
      .onSnapshot(querySnapshot => {
        let messages1 = []
        querySnapshot.forEach(doc => {
          messages1.push({ id: doc.id, ...doc.data() })
        })
        this.setState({ messages1 })
        console.log("Current messages: ", messages1.length)
      })

    
  }
  loadMessages = (id) =>{
      
    db.collection("messages").where("username","==",id)
    
    .onSnapshot(querySnapshot => {
      let messages = []
      querySnapshot.forEach(doc => {
        messages.push({ id: doc.id, ...doc.data() })
      })
      this.setState({ messages })
      console.log("Current messages for that user: ", messages.length)
    })

  }



  render() {
    return (
      <View style={styles.container}>
        
        <Text>Users Online</Text>
        {
            this.users.map(m =>
                <Button onPress={() => this.loadMessages(m.id)} title={m.id} style={{ width: 100, paddingTop: 20 }} />

            )}

        <Text>User's messages:</Text>
        {
          this.state.messages
          &&
          this.state.messages.map(m=>
            <Text>{m.message}</Text>)
          }

      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 15,
    backgroundColor: '#fff',
  },
});
