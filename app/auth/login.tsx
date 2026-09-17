import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Link } from 'expo-router';
import { FontAwesome } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { TypewriterText } from '../../components/authComponents/Components/TypewriterText';
import { useLogin } from '../../components/authComponents/Hooks/useLogin';

export default function LoginScreen() {
  const { email, setEmail, password, setPassword, handleLogin } = useLogin();

  return (
    <SafeAreaView className="flex-1" style={{ backgroundColor: Colors.light.background }}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View className="flex-1 justify-center items-center px-6 py-12">
            {/* Branding */}
            <Text style={{ fontSize: 40, fontWeight: '800', color: Colors.light.tint, marginBottom: 4 }}>
              ProsCard
            </Text>

            {/* Typewriter Slogan */}
            <View style={{ height: 24, marginBottom: 20 }}>
              <TypewriterText
                text="Your card, your way"
                speed={120}
                style={{
                  fontSize: 14,
                  color: Colors.light.mutedText,
                }}
              />
            </View>

            {/* Login Form */}
            <View style={{ width: '100%', padding: 24, borderRadius: 20 }}>
              <TextInput
                placeholder="Email or username"
                style={{
                  borderBottomWidth: 1,
                  borderColor: Colors.light.border,
                  marginBottom: 20,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: Colors.light.text,
                }}
                placeholderTextColor={Colors.light.mutedText}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
              />
              <TextInput
                placeholder="Password"
                style={{
                  borderBottomWidth: 1,
                  borderColor: Colors.light.border,
                  marginBottom: 8,
                  paddingVertical: 10,
                  fontSize: 14,
                  color: Colors.light.text,
                }}
                placeholderTextColor={Colors.light.mutedText}
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />

              {/* 🔐 Forgot Password Link */}
              <View style={{ alignItems: 'flex-end', marginBottom: 20 }}>
                <TouchableOpacity onPress={() => { /* TODO: Link to forgot password screen */ }}>
                  <Text style={{ fontSize: 13, color: Colors.light.tint, fontWeight: '500' }}>
                    Forgot Password?
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                style={{
                  backgroundColor: Colors.light.tint,
                  padding: 14,
                  borderRadius: 14,
                }}
                onPress={handleLogin}
              >
                <Text
                  style={{
                    color: Colors.palette.primaryWhite,
                    textAlign: 'center',
                    fontWeight: '700',
                    fontSize: 16,
                  }}
                >
                  Log In
                </Text>
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <Text style={{ color: Colors.light.mutedText, marginVertical: 24 }}>or continue with</Text>

            {/* Google Button */}
            <TouchableOpacity
              style={{
                backgroundColor: Colors.light.surface,
                paddingVertical: 12,
                paddingHorizontal: 24,
                borderRadius: 50,
                borderColor: Colors.light.border,
                borderWidth: 1,
                marginBottom: 24,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
              onPress={() => {
                // TODO: Handle Google login
              }}
            >
              <FontAwesome name="google" size={20} color={Colors.light.tint} />
              <Text style={{ fontSize: 16, fontWeight: '600', color: Colors.light.secondary }}>
                Sign in with Google
              </Text>
            </TouchableOpacity>

            {/* Footer */}
            <Text style={{ fontSize: 14, color: Colors.light.text }}>
              Don’t have an account?{' '}
              <Link href="/auth/signup" style={{ color: Colors.light.accent, fontWeight: '600' }}>
                Sign up
              </Link>
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
