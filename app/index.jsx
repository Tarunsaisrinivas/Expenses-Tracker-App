import { Image, StyleSheet, Text, View } from 'react-native'
import React, { useEffect } from 'react'

import { useRouter } from 'expo-router'

const index = () => {
    const router =  useRouter();
    useEffect(()=>{
        setTimeout(()=>{
            router.replace('/welcome')
        },2000)
    },[])
    

  return (
    <View style={styles.container}>
      <Image
      style ={styles.logo}
      source={require('../assets/splashImage.png')}
      />
    </View>
  )
}

export default index

const styles = StyleSheet.create({
    container:{
        flex:1,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:"#000",
    },
    logo:{
        height:"20%",
        aspectRatio:1,
    }
})