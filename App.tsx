import { View, Text } from 'react-native'
import React from 'react'
import AppNavigator from './src/navigation/AppNavigation'
import { AuthProvider } from './src/AuthContext'

const App = () => {
  return (
    <AuthProvider><AppNavigator/></AuthProvider>
    
  )
}

export default App