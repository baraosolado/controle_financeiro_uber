# 📱 Guia de Build do App Android

Este guia explica como gerar o APK do app Android usando Capacitor.

## ✅ App Android Funcional

Este é um **app Android nativo e funcional** que se conecta ao servidor Next.js. Todas as funcionalidades funcionam normalmente:
- ✅ Login e autenticação
- ✅ Dashboard com dados em tempo real
- ✅ Criação e edição de registros
- ✅ Todas as APIs funcionando
- ✅ Gráficos e relatórios
- ✅ Sistema completo funcionando

O app funciona como um **app nativo completo**, apenas precisa de conexão com a internet para se comunicar com o servidor backend.

### Como Funciona:

O app Android é um **app nativo funcional** que:
1. Abre como um app Android normal (ícone na tela inicial)
2. Se conecta ao servidor Next.js via internet
3. Todas as funcionalidades funcionam normalmente (login, dashboard, registros, etc.)
4. Funciona como qualquer app nativo que você baixa da Play Store

### Opções de Deploy:

1. **Produção (Recomendado)**: App se conecta ao servidor em produção (ex: `https://seu-dominio.com`)
2. **Desenvolvimento**: App se conecta ao servidor local (ex: `http://192.168.1.100:3000`)

## 📋 Pré-requisitos

1. **Node.js** instalado
2. **Java JDK 11 ou superior** instalado
3. **Android Studio** instalado
4. **Android SDK** configurado

## 🚀 Passo a Passo

### 1. Configurar Variáveis de Ambiente

Crie/edite o arquivo `.env` e adicione:

```env
# URL do servidor Next.js (produção)
CAPACITOR_SERVER_URL=https://seu-dominio.com

# Ou para desenvolvimento local, use o IP da sua máquina:
# CAPACITOR_SERVER_URL=http://192.168.1.100:3000
```

**Para descobrir seu IP local (Windows):**
```bash
ipconfig
# Procure por "IPv4 Address" na seção do seu adaptador de rede
```

### 2. Build do Next.js

```bash
npm run build
```

### 3. Sincronizar com Capacitor

```bash
npx cap sync
```

Este comando copia os arquivos necessários para a pasta `android/`.

### 4. Abrir no Android Studio

```bash
npx cap open android
```

Ou abra manualmente a pasta `android/` no Android Studio.

### 5. Configurar o App no Android Studio

#### 5.1. Verificar `build.gradle`

Abra `android/app/build.gradle` e verifique:

```gradle
android {
    namespace "com.controlefinanceirouber.app"
    compileSdk 34
    
    defaultConfig {
        applicationId "com.controlefinanceirouber.app"
        minSdk 24  // Android 7.0+
        targetSdk 34
        versionCode 1
        versionName "1.0.0"
    }
    // ...
}
```

#### 5.2. Verificar `AndroidManifest.xml`

Abra `android/app/src/main/AndroidManifest.xml` e verifique permissões:

```xml
<manifest>
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <application
        android:usesCleartextTraffic="true"  <!-- Apenas para desenvolvimento -->
        ...>
    </application>
</manifest>
```

**⚠️ Importante**: Remova `android:usesCleartextTraffic="true"` em produção!

### 6. Gerar APK

#### 6.1. APK de Debug (Teste)

No Android Studio:
1. Menu: **Build** → **Build Bundle(s) / APK(s)** → **Build APK(s)**
2. Aguarde o build completar
3. O APK estará em: `android/app/build/outputs/apk/debug/app-debug.apk`

#### 6.2. APK de Release (Produção)

**Passo 1: Criar Keystore (apenas uma vez)**

```bash
keytool -genkey -v -keystore controle-financeiro-uber.keystore -alias controle-financeiro-uber -keyalg RSA -keysize 2048 -validity 10000
```

Guarde a senha e as informações em local seguro!

**Passo 2: Configurar Variáveis de Ambiente**

Adicione no `.env`:

```env
ANDROID_KEYSTORE_PATH=./controle-financeiro-uber.keystore
ANDROID_KEYSTORE_ALIAS=controle-financeiro-uber
ANDROID_KEYSTORE_PASSWORD=sua-senha-aqui
ANDROID_KEYSTORE_ALIAS_PASSWORD=sua-senha-aqui
```

**Passo 3: Gerar APK Assinado**

No Android Studio:
1. Menu: **Build** → **Generate Signed Bundle / APK**
2. Selecione **APK**
3. Selecione o keystore criado
4. Digite as senhas
5. Selecione **release** como build variant
6. Clique em **Finish**

O APK estará em: `android/app/build/outputs/apk/release/app-release.apk`

## 🧪 Testar o App

### Emulador Android

1. No Android Studio, crie um AVD (Android Virtual Device)
2. Execute o app: **Run** → **Run 'app'**
3. Ou instale o APK manualmente no emulador

### Dispositivo Físico

1. Ative **Depuração USB** no seu dispositivo Android
2. Conecte via USB
3. Execute o app: **Run** → **Run 'app'**
4. Ou transfira o APK e instale manualmente

## 🔧 Troubleshooting

### Erro: "Cannot find module"

**Solução**: Execute `npx cap sync` novamente após fazer build.

### App não conecta ao servidor

**Verifique**:
1. URL do servidor está correta no `capacitor.config.ts`
2. Servidor Next.js está rodando
3. Firewall não está bloqueando conexões
4. Para desenvolvimento local, use o IP da máquina, não `localhost`

### Erro de permissões

**Solução**: Verifique se `AndroidManifest.xml` tem as permissões necessárias.

### Build falha no Android Studio

**Solução**:
1. Limpe o projeto: **Build** → **Clean Project**
2. Rebuild: **Build** → **Rebuild Project**
3. Sincronize Gradle: **File** → **Sync Project with Gradle Files**

## 📝 Notas Importantes

1. **O app precisa de internet** para funcionar (conecta ao servidor Next.js)
2. **Para produção**, configure `CAPACITOR_SERVER_URL` com a URL do seu servidor
3. **Para desenvolvimento**, use o IP local da sua máquina
4. **Não use `localhost`** no dispositivo físico - use o IP da máquina na rede

## 🚀 Próximos Passos

- [ ] Configurar ícone do app
- [ ] Configurar splash screen
- [ ] Publicar na Google Play Store
- [ ] Configurar notificações push (se necessário)

## 📚 Referências

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Studio Guide](https://developer.android.com/studio)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
