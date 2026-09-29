// components/editViewComponents/Components/CardPreview.tsx
import { View, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '@/constants/Colors';
import type { EditableCard } from '../types/editView.types';

export function CardPreview({ card }: { card: EditableCard }) {
  return (
    <LinearGradient
      colors={card.gradient}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={{
        borderRadius: 20,
        padding: 20,
        marginBottom: 16,
        minHeight: 160,
        justifyContent: 'space-between',
      }}
    >
      <View>
        <Text style={{ color: Colors.palette.primaryWhite, fontSize: 20, fontWeight: '800' }}>
          {card.name}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 2 }}>
          {card.title}
        </Text>
        <Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13 }}>{card.company}</Text>
      </View>

      <View>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>{card.phone}</Text>
        <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>{card.email}</Text>
      </View>
    </LinearGradient>
  );
}
