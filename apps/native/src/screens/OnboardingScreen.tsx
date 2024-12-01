import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Carousel from 'react-native-snap-carousel';
import { Dimensions } from 'react-native';

const { width: screenWidth } = Dimensions.get('window');

const OnboardingScreen = () => {
  const navigation = useNavigation();
  const [activeSlide, setActiveSlide] = useState(0);

  const carouselItems = [
    {
      title: 'The dance ecosystem in',
      accent: 'motiion',
      description: 'We aim to empower dancers with innovative tools and resources to enhance their mental health, financial stability, and creative expression, fostering a vibrant and sustainable ecosystem.',
      image: require('../assets/images/motif-2.png'),
    },
    {
      title: 'The online database for',
      accent: 'dance talent',
      description: 'Tools to help you manage your resume and headshots all in one platform.',
      image: require('../assets/images/motif-4.png'),
    },
  ];

  const renderItem = ({ item, index }) => {
    return (
      <View className="flex-1 justify-center items-center">
        <Image source={item.image} className="w-40 h-40 mb-8" />
        <Text className="text-2xl font-montserrat-bold mb-2">{item.title}</Text>
        <Text className="text-2xl font-montserrat-bold text-accent mb-4">{item.accent}</Text>
        <Text className="text-base font-inter-regular text-center px-8">{item.description}</Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-background">
      <Carousel
        data={carouselItems}
        renderItem={renderItem}
        sliderWidth={screenWidth}
        itemWidth={screenWidth}
        onSnapToItem={(index) => setActiveSlide(index)}
      />
      <View className="flex-row justify-center mb-8">
        {carouselItems.map((_, index) => (
          <View
            key={index}
            className={`w-2 h-2 mx-1 rounded-full ${index === activeSlide ? 'bg-accent' : 'bg-gray-300'
              }`}
          />
        ))}
      </View>
      <TouchableOpacity
        className="bg-primary py-3 px-6 rounded-full mx-8 mb-8"
        onPress={() => navigation.navigate('TalentHome')}
      >
        <Text className="text-white font-inter-medium text-center">
          {activeSlide === carouselItems.length - 1 ? "Let's Get Started" : 'Next'}
        </Text>
      </TouchableOpacity>
    </View>
  );
};

export default OnboardingScreen;
