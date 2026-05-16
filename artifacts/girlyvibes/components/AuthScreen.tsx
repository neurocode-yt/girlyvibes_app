import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { supabase } from '@/lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';
import { AppMaterialCommunityIcons as Icon } from '@/components/Icons';
import { useColors } from '@/hooks/useColors';
import { useLanguage } from '@/contexts/LanguageContext';

export function AuthScreen() {
  const colors = useColors();
  const { l, isRTL } = useLanguage();
  
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const validatePassword = (pass: string) => {
    if (pass.length < 8) return l("يجب أن تكون كلمة المرور 8 أحرف على الأقل.", "Password must be at least 8 characters.");
    const hasAlphaNumeric = /[a-zA-Z]/.test(pass) && /[0-9]/.test(pass);
    if (!hasAlphaNumeric) return l("يجب أن تحتوي كلمة المرور على أحرف وأرقام.", "Password must be alphanumeric.");
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(pass);
    if (!hasSpecialChar) return l("يجب أن تحتوي كلمة المرور على رمز خاص واحد على الأقل.", "Password must contain at least one special character.");
    return null;
  };

  const handleAuth = async () => {
    const cleanUser = username.trim().toLowerCase();
    if (!cleanUser || !password) {
      Alert.alert(l("خطأ", "Error"), l("الرجاء إدخال اسم المستخدم وكلمة المرور", "Please enter username and password"));
      return;
    }

    if (!isLogin) {
      const passError = validatePassword(password);
      if (passError) {
        Alert.alert(l("كلمة مرور ضعيفة", "Weak Password"), passError);
        return;
      }
    }

    setLoading(true);
    // Use a dummy domain to satisfy Supabase's internal requirement for auth without exposing it to the user
    const authIdentifier = `${cleanUser}@girlyvibes.app`;

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email: authIdentifier, password });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({ 
          email: authIdentifier, 
          password,
          options: {
            data: { username: cleanUser }
          }
        });
        if (error) throw error;
      }
    } catch (err: any) {
      Alert.alert(l("فشل المصادقة", "Authentication Failed"), err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnonymous = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInAnonymously();
      if (error) throw error;
    } catch (err: any) {
      Alert.alert(l("خطأ", "Error"), err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LinearGradient colors={[colors.background, colors.card]} style={styles.container}>
      <View style={styles.card}>
        <View style={styles.logoContainer}>
          <Icon name="star-four-points" size={48} color={colors.primary} />
          <Text style={[styles.title, { color: colors.foreground }]}>
            {l("جيرلي ڤايبس", "GirlyVibes")}
          </Text>
        </View>

        <Text style={[styles.subtitle, { color: colors.mutedForeground }]}>
          {isLogin 
            ? l("مرحباً بعودتك! الرجاء تسجيل الدخول", "Welcome back! Please log in") 
            : l("إنشاء حساب جديد", "Create a new account")}
        </Text>

        <View style={styles.inputContainer}>
          <Icon name="account-outline" size={20} color={colors.mutedForeground} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={l("اسم المستخدم", "Username")}
            placeholderTextColor={colors.mutedForeground}
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>

        <View style={styles.inputContainer}>
          <Icon name="lock-outline" size={20} color={colors.mutedForeground} style={styles.inputIcon} />
          <TextInput
            style={[styles.input, { color: colors.foreground, textAlign: isRTL ? 'right' : 'left' }]}
            placeholder={l("كلمة المرور", "Password")}
            placeholderTextColor={colors.mutedForeground}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <Pressable onPress={() => setShowPassword(!showPassword)} style={{ padding: 4 }}>
            <Icon 
              name={showPassword ? "eye-off-outline" : "eye-outline"} 
              size={20} 
              color={colors.mutedForeground} 
            />
          </Pressable>
        </View>

        <Pressable 
          style={[styles.primaryButton, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }]} 
          onPress={handleAuth}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>
              {isLogin ? l("تسجيل الدخول", "Log In") : l("إنشاء حساب", "Sign Up")}
            </Text>
          )}
        </Pressable>

        <Pressable style={styles.toggleButton} onPress={() => setIsLogin(!isLogin)}>
          <Text style={[styles.toggleText, { color: colors.primary }]}>
            {isLogin 
              ? l("لا تملك حساباً؟ سجل الآن", "Don't have an account? Sign up") 
              : l("لديك حساب بالفعل؟ تسجيل الدخول", "Already have an account? Log in")}
          </Text>
        </Pressable>

        <View style={styles.dividerContainer}>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
          <Text style={[styles.dividerText, { color: colors.mutedForeground }]}>{l("أو", "OR")}</Text>
          <View style={[styles.divider, { backgroundColor: colors.border }]} />
        </View>

        <Pressable 
          style={[styles.secondaryButton, { borderColor: colors.border, backgroundColor: colors.background }]} 
          onPress={handleAnonymous}
          disabled={loading}
        >
          <Icon name="incognito" size={20} color={colors.foreground} />
          <Text style={[styles.secondaryButtonText, { color: colors.foreground }]}>
            {l("الاستمرار كزائر", "Continue as anonymous")}
          </Text>
        </Pressable>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.8)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Inter_700Bold',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
    textAlign: 'center',
    marginBottom: 24,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 54,
    backgroundColor: '#fff',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 16,
  },
  primaryButton: {
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 16,
    shadowColor: '#C2185B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Inter_600SemiBold',
  },
  toggleButton: {
    alignItems: 'center',
    marginBottom: 24,
  },
  toggleText: {
    fontSize: 14,
    fontFamily: 'Inter_500Medium',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  divider: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontFamily: 'Inter_400Regular',
  },
  secondaryButton: {
    flexDirection: 'row',
    height: 54,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  secondaryButtonText: {
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
});
