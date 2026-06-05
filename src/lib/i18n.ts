export type Lang = "en" | "az" | "tr" | "ru";

const T = {
  // Auth
  login:              { en: "Login",          az: "Giriş",         tr: "Giriş",         ru: "Войти"         },
  register:           { en: "Register",        az: "Qeydiyyat",     tr: "Kayıt Ol",      ru: "Регистрация"   },
  email:              { en: "Email",           az: "E-poçt",        tr: "E-posta",       ru: "Почта"         },
  password:           { en: "Password",        az: "Şifrə",         tr: "Şifre",         ru: "Пароль"        },
  fullName:           { en: "Full name",       az: "Ad Soyad",      tr: "Ad Soyad",      ru: "Имя Фамилия"   },
  signIn:             { en: "Sign in",         az: "Daxil ol",      tr: "Giriş Yap",     ru: "Войти"         },
  createAccount:      { en: "Create account",  az: "Hesab yarat",   tr: "Hesap Oluştur", ru: "Создать аккаунт"},
  continueGoogle:     { en: "Continue with Google", az: "Google ilə daxil ol", tr: "Google ile Giriş", ru: "Войти через Google" },
  noAccount:          { en: "No account? ",    az: "Hesabınız yoxdur? ",  tr: "Hesabın yok mu? ", ru: "Нет аккаунта? " },
  haveAccount:        { en: "Have an account? ", az: "Artıq hesabınız var? ", tr: "Hesabın var mı? ", ru: "Есть аккаунт? " },
  emailPlaceholder:   { en: "Email address",   az: "E-poçt ünvanı", tr: "E-posta adresi", ru: "Адрес почты"  },
  passwordPlaceholder:{ en: "Password",        az: "Şifrə",         tr: "Şifre",         ru: "Пароль"        },
  passwordMin:        { en: "Password must be at least 6 characters", az: "Şifrə ən az 6 simvol olmalıdır", tr: "Şifre en az 6 karakter olmalı", ru: "Пароль минимум 6 символов" },
  emailRequired:      { en: "Enter your email", az: "E-poçt daxil edin", tr: "E-postanı girin", ru: "Введите почту" },
  loginError:         { en: "Wrong email or password.", az: "E-poçt və ya şifrə səhvdir.", tr: "E-posta veya şifre hatalı.", ru: "Неверный email или пароль." },
  alreadyExists:      { en: "This email is already registered.", az: "Bu e-poçt artıq qeydiyyatdan keçib.", tr: "Bu e-posta zaten kayıtlı.", ru: "Этот email уже зарегистрирован." },
  confirmEmail:       { en: "Registration successful! Please verify your email, then log in.", az: "Qeydiyyat uğurlu! E-poçtunuzu təsdiqləyin, sonra giriş edin.", tr: "Kayıt başarılı! E-postanı doğrula, sonra giriş yap.", ru: "Регистрация успешна! Подтвердите почту, затем войдите." },
  googleFail:         { en: "Google sign in failed. Please try again.", az: "Google ilə giriş uğursuz oldu. Yenidən cəhd edin.", tr: "Google ile giriş başarısız. Tekrar deneyin.", ru: "Ошибка входа через Google. Попробуйте снова." },
  or:                 { en: "or",              az: "və ya",         tr: "veya",          ru: "или"           },
  appSubtitle:        { en: "AI Weather Assistant", az: "AI Hava Assistanı", tr: "AI Hava Asistanı", ru: "AI Погодный Ассистент" },
  footer:             { en: "© 2025 HAVAİ — AI Weather Assistant", az: "© 2025 HAVAİ — AI Hava Assistanı", tr: "© 2025 HAVAİ — AI Hava Asistanı", ru: "© 2025 HAVAİ — AI Погодный Ассистент" },

  // Home
  searchCity:         { en: "Search city...",  az: "Şəhər axtar...", tr: "Şehir ara...",  ru: "Поиск города..." },
  offline:            { en: "Offline — cached data", az: "Offline — keşlənmiş məlumat", tr: "Çevrimdışı — önbellekten", ru: "Офлайн — кешированные данные" },
  retry:              { en: "Retry",           az: "Yenidən cəhd et", tr: "Tekrar Dene",  ru: "Повторить"     },
  day:                { en: "Day",             az: "Gündüz",        tr: "Gündüz",        ru: "День"          },
  night:              { en: "Night",           az: "Gecə",          tr: "Gece",          ru: "Ночь"          },
  feelsLike:          { en: "Feels like",      az: "Hiss edilir",   tr: "Hissedilen",    ru: "Ощущается"     },
  humidity:           { en: "Humidity",        az: "Rütubət",       tr: "Nem",           ru: "Влажность"     },
  wind:               { en: "Wind",            az: "Külək",         tr: "Rüzgar",        ru: "Ветер"         },
  visibility:         { en: "Visibility",      az: "Görüş",         tr: "Görüş",         ru: "Видимость"     },
  pressure:           { en: "Pressure",        az: "Təzyiq",        tr: "Basınç",        ru: "Давление"      },
  sunrise:            { en: "Sunrise",         az: "Çıxış",         tr: "Gün Doğumu",    ru: "Восход"        },
  sunset:             { en: "Sunset",          az: "Batış",         tr: "Gün Batımı",    ru: "Закат"         },
  hourlyForecast:     { en: "Hourly forecast", az: "Saatlıq proqnoz", tr: "Saatlik Tahmin", ru: "Почасовой прогноз" },
  sevenDay:           { en: "7-day forecast",  az: "7 günlük proqnoz", tr: "7 Günlük Tahmin", ru: "Прогноз на 7 дней" },
  rainRadar:          { en: "Rain Radar",      az: "Yağış Radari",  tr: "Yağış Radarı",  ru: "Радар дождя"   },

  // Profile
  subscription:       { en: "Subscription",   az: "Abunəlik",      tr: "Abonelik",      ru: "Подписка"      },
  freePlan:           { en: "Free Plan",       az: "Pulsuz Plan",   tr: "Ücretsiz Plan", ru: "Бесплатный"    },
  upgrade:            { en: "Upgrade",         az: "Yüksəlt",       tr: "Yükselt",       ru: "Улучшить"      },
  cancelSub:          { en: "Cancel subscription", az: "Abunəliyi ləğv et", tr: "Aboneliği İptal Et", ru: "Отменить подписку" },
  cancelConfirm:      { en: "Confirm?",        az: "Təsdiq et?",    tr: "Onayla?",       ru: "Подтвердить?"  },
  savedCities:        { en: "Saved Cities",    az: "Saxlanılmış Şəhərlər", tr: "Kaydedilen Şehirler", ru: "Сохранённые города" },
  display:            { en: "Display",         az: "Görünüş",       tr: "Görünüm",       ru: "Внешний вид"   },
  theme:              { en: "Theme",           az: "Tema",          tr: "Tema",          ru: "Тема"          },
  themeDark:          { en: "Dark",            az: "Tünd",          tr: "Koyu",          ru: "Тёмная"        },
  themeMidnight:      { en: "Midnight",        az: "Gecə",          tr: "Gece",          ru: "Полночь"       },
  themeLight:         { en: "Light",           az: "Açıq",          tr: "Açık",          ru: "Светлая"       },
  language:           { en: "Language",        az: "Dil",           tr: "Dil",           ru: "Язык"          },
  temperature:        { en: "Temperature",     az: "Temperatur",    tr: "Sıcaklık",      ru: "Температура"   },
  notifications:      { en: "Notifications",   az: "Bildirişlər",   tr: "Bildirimler",   ru: "Уведомления"   },
  morningForecast:    { en: "Morning forecast", az: "Səhər proqnozu", tr: "Sabah Tahmini", ru: "Утренний прогноз" },
  rainAlert:          { en: "Rain alert",      az: "Yağış xəbərdarlığı", tr: "Yağmur Uyarısı", ru: "Предупреждение о дожде" },
  stormAlert:         { en: "Storm alert",     az: "Fırtına xəbərdarlığı", tr: "Fırtına Uyarısı", ru: "Предупреждение о буре" },
  tempExtremes:       { en: "Temp extremes",   az: "İsti/Soyuq xəbərdarlığı", tr: "Sıcaklık Aşırılığı", ru: "Экстремальные температуры" },
  account:            { en: "Account",         az: "Hesab",         tr: "Hesap",         ru: "Аккаунт"       },
  signOut:            { en: "Sign out",        az: "Çıxış",         tr: "Çıkış Yap",     ru: "Выйти"         },
  deleteAccount:      { en: "Delete account",  az: "Hesabı sil",    tr: "Hesabı Sil",    ru: "Удалить аккаунт"},
  about:              { en: "About",           az: "Haqqında",      tr: "Hakkında",      ru: "О приложении"  },
  version:            { en: "Version",         az: "Versiya",       tr: "Sürüm",         ru: "Версия"        },
  contact:            { en: "Contact",         az: "Əlaqə",         tr: "İletişim",      ru: "Контакт"       },
  rateApp:            { en: "Rate app",        az: "Qiymət ver",    tr: "Puanla",        ru: "Оценить"       },
  loginRequired:      { en: "Login required",  az: "Giriş tələb olunur", tr: "Giriş Gerekli", ru: "Требуется вход" },
  signInAccount:      { en: "Sign in to your account", az: "Hesabınıza daxil olun", tr: "Hesabına giriş yap", ru: "Войдите в аккаунт" },
  syncDevices:        { en: "Sync your settings across devices", az: "Parametrlərinizi bütün cihazlarda saxlayın", tr: "Ayarlarını tüm cihazlarda senkronla", ru: "Синхронизируй настройки на всех устройствах" },
  confirmLogout:      { en: "Confirm?",        az: "Təsdiq et?",    tr: "Onayla?",       ru: "Подтвердить?"  },
  deleteConfirmTitle: { en: "Delete account",  az: "Hesabı sil",    tr: "Hesabı Sil",    ru: "Удалить аккаунт"},
  deleteConfirmMsg:   { en: "This cannot be undone. Continue?", az: "Bu əməliyyat geri qaytarıla bilməz. Davam etmək istəyirsiniz?", tr: "Bu geri alınamaz. Devam etmek istiyor musun?", ru: "Это нельзя отменить. Продолжить?" },
  cancel:             { en: "Cancel",          az: "Ləğv et",       tr: "İptal",         ru: "Отмена"        },
  delete:             { en: "Delete",          az: "Sil",           tr: "Sil",           ru: "Удалить"       },

  // AI
  aiAdvice:           { en: "AI Advice",       az: "AI Məsləhəti",  tr: "AI Tavsiyesi",  ru: "AI Советы"     },
  aiAdviceSub:        { en: "Weather-based recommendations", az: "Hava şəraitinə uyğun tövsiyələr", tr: "Hava durumuna göre tavsiyeler", ru: "Рекомендации по погоде" },
  getAdvice:          { en: "Get advice",      az: "Məsləhət al",   tr: "Tavsiye Al",    ru: "Получить совет"},
  clothing:           { en: "Clothing",        az: "Geyim tövsiyəsi", tr: "Kıyafet Tavsiyesi", ru: "Одежда"  },
  warnings:           { en: "Warnings",        az: "Xəbərdarlıqlar", tr: "Uyarılar",     ru: "Предупреждения"},
  walkingRoute:       { en: "Walking route",   az: "Gəzinti marşrutu", tr: "Yürüyüş Rotası", ru: "Маршрут прогулки" },
  chooseMap:          { en: "Choose map app",  az: "Xəritə tətbiqini seçin", tr: "Harita uygulaması seç", ru: "Выберите карту" },

  // Chat
  aiChat:             { en: "AI Chat",         az: "AI Söhbət",     tr: "AI Sohbet",     ru: "AI Чат"        },
  typeMessage:        { en: "Type a message...", az: "Mesaj yazın...", tr: "Mesaj yaz...", ru: "Напишите сообщение..." },
  chatWithRole:       { en: "Chat with",       az: "ilə danış",     tr: "ile sohbet et", ru: "Чат с"         },
  askWeather:         { en: "Ask anything about the weather", az: "Hava haqqında istənilən şeyi soruşa bilərsiniz", tr: "Hava hakkında her şeyi sorabilirsin", ru: "Спросите всё о погоде" },
  friend:             { en: "Friend",          az: "Dost",          tr: "Arkadaş",       ru: "Друг"          },
  expert:             { en: "Expert",          az: "Ekspert",       tr: "Uzman",         ru: "Эксперт"       },
  official:           { en: "Official",        az: "Rəsmi",         tr: "Resmi",         ru: "Официальный"   },
  humor:              { en: "Humor",           az: "Yumorlu",       tr: "Komik",         ru: "Юмор"          },
  premiumRequired:    { en: "AI Chat is a Premium feature.", az: "AI Söhbət funksiyası Premium istifadəçilər üçündür.", tr: "AI Sohbet Premium özelliğidir.", ru: "AI Чат — функция Premium." },
  advicePremium:      { en: "AI Advice is a Premium feature.", az: "AI Məsləhət funksiyası Premium istifadəçilər üçündür.", tr: "AI Tavsiyesi Premium özelliğidir.", ru: "AI Советы — функция Premium." },

  // Nowcast (dəqiqəlik yağış)
  nowcastTitle:       { en: "Precipitation",   az: "Yağıntı",       tr: "Yağış",         ru: "Осадки"        },
  rainStartsIn:       { en: "Rain starting in", az: "Yağış başlayır", tr: "Yağış başlıyor", ru: "Дождь начнётся через" },
  rainStopsIn:        { en: "Rain stopping in", az: "Yağış dayanır", tr: "Yağış duruyor", ru: "Дождь закончится через" },
  rainOngoing:        { en: "Rain continues for the next 2 hours", az: "Yağış növbəti 2 saat davam edir", tr: "Yağmur 2 saat devam ediyor", ru: "Дождь продолжится 2 часа" },
  noRain:             { en: "No rain in the next 2 hours", az: "Növbəti 2 saat yağış yoxdur", tr: "2 saat yağış yok", ru: "Дождя не будет 2 часа" },
  minutesShort:       { en: "min",             az: "dəq",           tr: "dk",            ru: "мин"           },
  now:                { en: "Now",             az: "İndi",          tr: "Şimdi",         ru: "Сейчас"        },

  // Health (sağlamlıq paneli)
  healthTitle:        { en: "Health & Air",    az: "Sağlamlıq & Hava", tr: "Sağlık & Hava", ru: "Здоровье и воздух" },
  airQuality:         { en: "Air Quality",     az: "Hava keyfiyyəti", tr: "Hava Kalitesi", ru: "Качество воздуха" },
  uvIndex:            { en: "UV Index",        az: "UV indeksi",    tr: "UV İndeksi",    ru: "УФ-индекс"     },
  pollen:             { en: "Pollen",          az: "Polen",         tr: "Polen",         ru: "Пыльца"        },
  healthPremium:      { en: "Health insights are a Premium feature", az: "Sağlamlıq məlumatları Premium funksiyadır", tr: "Sağlık bilgileri Premium özelliğidir", ru: "Данные о здоровье — функция Premium" },
  unlockPremium:      { en: "Unlock Premium",  az: "Premium aç",    tr: "Premium'u Aç",  ru: "Открыть Premium" },

  // AQI / UV / Pollen kateqoriyaları
  good:               { en: "Good",            az: "Yaxşı",         tr: "İyi",           ru: "Хорошо"        },
  moderate:           { en: "Moderate",        az: "Orta",          tr: "Orta",          ru: "Умеренно"      },
  sensitive:          { en: "Sensitive",       az: "Həssas",        tr: "Hassas",        ru: "Чувствительно" },
  unhealthy:          { en: "Unhealthy",       az: "Zərərli",       tr: "Sağlıksız",     ru: "Вредно"        },
  veryBad:            { en: "Very unhealthy",  az: "Çox zərərli",   tr: "Çok Kötü",      ru: "Очень вредно"  },
  hazardous:          { en: "Hazardous",       az: "Təhlükəli",     tr: "Tehlikeli",     ru: "Опасно"        },
  low:                { en: "Low",             az: "Aşağı",         tr: "Düşük",         ru: "Низкий"        },
  high:               { en: "High",            az: "Yüksək",        tr: "Yüksek",        ru: "Высокий"       },
  veryHigh:           { en: "Very high",       az: "Çox yüksək",    tr: "Çok Yüksek",    ru: "Очень высокий" },
  extreme:            { en: "Extreme",         az: "Həddindən artıq", tr: "Aşırı",       ru: "Экстремальный" },

  // Əlavə UI mətnləri
  noNotifications:    { en: "No notifications", az: "Bildiriş yoxdur", tr: "Bildirim yok", ru: "Нет уведомлений" },
  subCancelledTitle:  { en: "Subscription cancelled", az: "Abunəlik ləğv edildi", tr: "Abonelik iptal edildi", ru: "Подписка отменена" },
  subCancelledMsg:    { en: "Your premium subscription has been cancelled.", az: "Premium abunəliyiniz ləğv edildi.", tr: "Premium aboneliğin iptal edildi.", ru: "Ваша подписка Premium отменена." },
  errorTitle:         { en: "Error",           az: "Xəta",          tr: "Hata",          ru: "Ошибка"        },
  cancelFailed:       { en: "Could not cancel subscription.", az: "Ləğv etmək mümkün olmadı.", tr: "İptal edilemedi.", ru: "Не удалось отменить." },
  cancelling:         { en: "Cancelling...",   az: "Ləğv edilir...", tr: "İptal ediliyor...", ru: "Отмена..."   },
  freeTitle:          { en: "Free Plan",       az: "Pulsuz Plan",   tr: "Ücretsiz Plan", ru: "Бесплатный"    },
  contactUs:          { en: "Contact us",      az: "Bizimlə əlaqə", tr: "Bize ulaşın",   ru: "Связаться с нами" },
  rateTitle:          { en: "Rate the app",    az: "Tətbiqə qiymət ver", tr: "Uygulamayı puanla", ru: "Оценить приложение" },
  rateMsg:            { en: "Coming soon to the App Store.", az: "Tezliklə App Store-da mövcud olacaq.", tr: "Yakında App Store'da.", ru: "Скоро в App Store." },
  aiError:            { en: "An error occurred.", az: "Xəta baş verdi.", tr: "Bir hata oluştu.", ru: "Произошла ошибка." },
  aiErrorRetry:       { en: "An error occurred. Please try again.", az: "Xəta baş verdi. Yenidən cəhd edin.", tr: "Bir hata oluştu. Tekrar deneyin.", ru: "Ошибка. Попробуйте снова." },
  typing:             { en: "Typing...",       az: "Yazır...",      tr: "Yazıyor...",    ru: "Печатает..."   },
  adviceFailed:       { en: "Could not get AI advice.", az: "AI məsləhəti alına bilmədi.", tr: "AI tavsiyesi alınamadı.", ru: "Не удалось получить совет." },
  cancelSubTitle:     { en: "Cancel subscription", az: "Abunəliyi ləğv et", tr: "Aboneliği İptal Et", ru: "Отменить подписку" },
  suggest1:           { en: "How's the weather today?", az: "Bu gün hava necədir?", tr: "Bugün hava nasıl?", ru: "Какая сегодня погода?" },
  suggest2:           { en: "Do I need an umbrella?", az: "Çətir lazımdırmı?", tr: "Şemsiye gerekli mi?", ru: "Нужен ли зонт?" },
  suggest3:           { en: "Rain this weekend?", az: "Həftəsonu yağış olacaq?", tr: "Hafta sonu yağmur var mı?", ru: "Будет ли дождь в выходные?" },

  // Premium ekranı
  premiumActive:      { en: "Premium Active!", az: "Premium Aktivdir!", tr: "Premium Aktif!", ru: "Premium активен!" },
  premiumActiveSub:   { en: "You have access to all features.", az: "Bütün funksiyalardan istifadə edə bilərsiniz.", tr: "Tüm özelliklere erişebilirsin.", ru: "У вас есть доступ ко всем функциям." },
  goPremium:          { en: "Go Premium",      az: "Premium-a keçin", tr: "Premium'a Geç", ru: "Перейти на Premium" },
  unlockAllAI:        { en: "Unlock all AI features", az: "Bütün AI funksiyaların kilidini açın", tr: "Tüm AI özelliklerini aç", ru: "Откройте все AI-функции" },
  perMonth:           { en: "/ month",         az: "/ ay",          tr: "/ ay",          ru: "/ месяц"       },
  getPremium:         { en: "Get Premium",     az: "Premium Al",    tr: "Premium Al",    ru: "Купить Premium" },
  paymentNote:        { en: "Payment will complete in your web browser", az: "Ödəniş veb brauzerinizdə tamamlanacaq", tr: "Ödeme web tarayıcında tamamlanacak", ru: "Оплата завершится в браузере" },
  featAdvice:         { en: "AI Weather Advice", az: "AI Hava Məsləhəti", tr: "AI Hava Tavsiyesi", ru: "AI Советы по погоде" },
  featChat:           { en: "AI Chat (4 roles)", az: "AI Söhbəti (4 rol)", tr: "AI Sohbet (4 rol)", ru: "AI Чат (4 роли)" },
  featHealth:         { en: "UV & Air Quality", az: "UV & Hava Keyfiyyəti", tr: "UV & Hava Kalitesi", ru: "УФ и качество воздуха" },
  featSummary:        { en: "Weekly Summary",  az: "Həftəlik Xülasə", tr: "Haftalık Özet", ru: "Недельная сводка" },
  featSupport:        { en: "Premium Support", az: "Premium Dəstək", tr: "Premium Destek", ru: "Premium поддержка" },

  // Saved tab
  savedTab:           { en: "Saved",           az: "Yerlər",        tr: "Kayıtlı",       ru: "Места"         },
  savedTitle:         { en: "Saved Places",    az: "Saxlanılan Yerlər", tr: "Kayıtlı Yerler", ru: "Сохранённые места" },
  noSaved:            { en: "No saved places yet", az: "Hələ yer saxlanılmayıb", tr: "Henüz kayıtlı yer yok", ru: "Пока нет сохранённых мест" },
  noSavedSub:         { en: "Search a city and tap the bookmark to save it", az: "Şəhər axtarın və saxlamaq üçün əlfəcinə toxunun", tr: "Bir şehir arayın ve kaydetmek için yer imine dokunun", ru: "Найдите город и нажмите закладку, чтобы сохранить" },
  loginToSave:        { en: "Sign in to save places", az: "Yer saxlamaq üçün daxil olun", tr: "Yer kaydetmek için giriş yapın", ru: "Войдите, чтобы сохранять места" },

  // Tab etiketləri
  tabWeather:         { en: "Weather",         az: "Hava",          tr: "Hava",          ru: "Погода"        },
  tabAI:              { en: "AI",              az: "AI",            tr: "AI",            ru: "AI"            },
  tabChat:            { en: "Chat",            az: "Söhbət",        tr: "Sohbet",        ru: "Чат"           },
  tabProfile:         { en: "Profile",         az: "Profil",        tr: "Profil",        ru: "Профиль"       },

  // Auth — veb versiyasına uyğun
  welcomeBack:        { en: "Welcome back",    az: "Xoş gəldiniz",  tr: "Tekrar hoş geldin", ru: "С возвращением" },
  createAccountTitle: { en: "Create account",  az: "Hesab yaradın", tr: "Hesap oluştur", ru: "Создать аккаунт" },
  loginSubtitle:      { en: "Sign in to your account", az: "Hesabınıza daxil olun", tr: "Hesabına giriş yap", ru: "Войдите в свой аккаунт" },
  registerSubtitle:   { en: "Create an account to get started", az: "Başlamaq üçün hesab yaradın", tr: "Başlamak için hesap oluştur", ru: "Создайте аккаунт, чтобы начать" },
  emailLabel:         { en: "Email address",   az: "E-poçt ünvanı", tr: "E-posta adresi", ru: "Адрес почты"  },
  passwordLabel:      { en: "Password",        az: "Şifrə",         tr: "Şifre",         ru: "Пароль"        },
  nameLabel:          { en: "Full name",       az: "Ad Soyad",      tr: "Ad Soyad",      ru: "Имя Фамилия"   },
  namePlaceholder:    { en: "Enter your name", az: "Adınızı daxil edin", tr: "Adını gir",  ru: "Введите имя"   },
  passwordEnterHint:  { en: "Enter your password", az: "Şifrənizi daxil edin", tr: "Şifreni gir", ru: "Введите пароль" },
  agreeTerms:         { en: "I agree to the Terms of Service and Privacy Policy", az: "İstifadə Şərtləri və Gizlilik Siyasətini qəbul edirəm", tr: "Kullanım Şartları ve Gizlilik Politikasını kabul ediyorum", ru: "Я принимаю Условия использования и Политику конфиденциальности" },
  acceptTermsError:   { en: "Please accept the terms", az: "Şərtləri qəbul edin", tr: "Şartları kabul edin", ru: "Примите условия" },

  // Premium qiymət
  monthly:            { en: "Monthly",         az: "Aylıq",         tr: "Aylık",         ru: "Месячно"       },
  yearly:             { en: "Yearly",          az: "İllik",         tr: "Yıllık",        ru: "Годовой"       },
  perYear:            { en: "/ year",          az: "/ il",          tr: "/ yıl",         ru: "/ год"         },
  bestValue:          { en: "BEST VALUE",      az: "ƏN SƏRFƏLİ",    tr: "EN İYİ",        ru: "ВЫГОДНО"       },
  save44:             { en: "Save 44%",        az: "44% qənaət",    tr: "%44 tasarruf",  ru: "Скидка 44%"    },
  perMonthShort:      { en: "/mo",             az: "/ay",           tr: "/ay",           ru: "/мес"          },
  premiumTagline:     { en: "Complete weather experience powered by AI", az: "AI gücü ilə tam hava təcrübəsi", tr: "AI gücüyle tam hava deneyimi", ru: "Полный погодный опыт на базе AI" },
  choosePlan:         { en: "Choose your plan", az: "Planınızı seçin", tr: "Planını seç",   ru: "Выберите план" },
  recommended:        { en: "RECOMMENDED",     az: "TÖVSİYƏ OLUNUR", tr: "ÖNERİLEN",      ru: "РЕКОМЕНДУЕМ"   },
  securePayment:      { en: "Secure payment with Stripe", az: "Stripe ilə təhlükəsiz ödəniş", tr: "Stripe ile güvenli ödeme", ru: "Безопасная оплата через Stripe" },
  billedYearly:       { en: "billed yearly",   az: "illik ödəniş",  tr: "yıllık ödeme",  ru: "оплата за год" },
  // Premium funksiya siyahısı
  feat7day:           { en: "7-day forecast",  az: "7 günlük proqnoz", tr: "7 günlük tahmin", ru: "Прогноз на 7 дней" },
  featWarnings:       { en: "Weather warnings", az: "Hava xəbərdarlıqları", tr: "Hava uyarıları", ru: "Погодные предупреждения" },
  featRoute:          { en: "Walking route (Maps)", az: "Gəzinti marşrutu (Xəritə)", tr: "Yürüyüş rotası (Harita)", ru: "Маршрут прогулки (Карты)" },
  featCities:         { en: "Unlimited saved cities", az: "Limitsiz saxlanılan şəhər", tr: "Sınırsız kayıtlı şehir", ru: "Безлимит сохранённых городов" },
  featAdFree:         { en: "Ad-free experience", az: "Reklamsız təcrübə", tr: "Reklamsız deneyim", ru: "Без рекламы" },
} as const;

type TKey = keyof typeof T;

export function t(key: TKey, lang: Lang): string {
  const entry = T[key] as Record<string, string>;
  return entry[lang] ?? entry["en"] ?? key;
}

// Həftə günləri (qısa) və aylar — proqnoz tarixləri üçün
const WEEKDAYS: Record<Lang, string[]> = {
  en: ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
  az: ["B.","B.e","Ç.a","Çər","C.a","Cüm","Şən"],
  tr: ["Paz","Pzt","Sal","Çar","Per","Cum","Cmt"],
  ru: ["Вс","Пн","Вт","Ср","Чт","Пт","Сб"],
};

const MONTHS: Record<Lang, string[]> = {
  en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  az: ["Yan","Fev","Mar","Apr","May","İyn","İyl","Avq","Sen","Okt","Noy","Dek"],
  tr: ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"],
  ru: ["Янв","Фев","Мар","Апр","Май","Июн","Июл","Авг","Сен","Окт","Ноя","Дек"],
};

const TODAY: Record<Lang, string>    = { en: "Today",    az: "Bu gün", tr: "Bugün",  ru: "Сегодня" };
const TOMORROW: Record<Lang, string> = { en: "Tomorrow", az: "Sabah",  tr: "Yarın",  ru: "Завтра"  };

// İndekslə (0 = bu gün) proqnoz gün adı və tarixi qaytarır
export function forecastDayLabel(index: number, lang: Lang): { day: string; date: string } {
  const d = new Date();
  d.setDate(d.getDate() + index);
  const day =
    index === 0 ? TODAY[lang]
    : index === 1 ? TOMORROW[lang]
    : WEEKDAYS[lang][d.getDay()];
  const date = `${d.getDate()} ${MONTHS[lang][d.getMonth()]}`;
  return { day, date };
}

export const LANG_OPTIONS: { code: Lang; label: string; flag: string }[] = [
  { code: "en", label: "English",    flag: "🇬🇧" },
  { code: "az", label: "Azərbaycan", flag: "🇦🇿" },
  { code: "tr", label: "Türkçe",     flag: "🇹🇷" },
  { code: "ru", label: "Русский",    flag: "🇷🇺" },
];
