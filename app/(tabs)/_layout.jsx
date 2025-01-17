import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import AntDesign from '@expo/vector-icons/AntDesign';
export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown:false,tabBarActiveTintColor: 'white' }}>
      
     
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarStyle: { backgroundColor: '#000' },
          tabBarIcon: ({ color }) => <AntDesign size={28} name="home" color="#4CAF50" />,
        }}
      />
       <Tabs.Screen
      name='(edit)'
      options={{
        title: 'settings',
        
        // headerStyle: { backgroundColor: '#9d6b53' },
        headerTintColor:"#fff", 
        tabBarIcon: ({ color }) => <AntDesign size={28} name="user" color="#4CAF50" />,
        tabBarStyle: { backgroundColor: '#000' },
      }}
      />

      {/* <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <FontAwesome size={28} name="cog" color={color} />,
        }}
      /> */}
    </Tabs>
  );
}
