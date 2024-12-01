import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const LoginScreen = () => {
  const navigation = useNavigation();

  return (
    <View className="flex-1 justify-center items-center bg-background">
      <Text className="text-3xl font-montserrat-bold mb-8">Motiion</Text>
      <TouchableOpacity
        className="bg-primary py-3 px-6 rounded-full"
        onPress={() => navigation.navigate('Onboarding')}
      >
        <Text className="text-white font-inter-medium">Sign In</Text>
      </TouchableOpacity>
    </View>
  );
};

export default LoginScreen;
