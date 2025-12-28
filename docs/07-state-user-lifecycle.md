# State Diagram - Kullanıcı Hesap Yaşam Döngüsü

```mermaid
stateDiagram-v2
    [*] --> Kayıtsız

    Kayıtsız --> KayıtBekliyor: Register İsteği
    KayıtBekliyor --> Aktif: Kayıt Onaylandı
    KayıtBekliyor --> Kayıtsız: Validation Hatası

    Aktif --> Aktif: Login/Logout
    Aktif --> ProfilGüncelleniyor: Profil Düzenle
    ProfilGüncelleniyor --> Aktif: Güncelleme Başarılı
    ProfilGüncelleniyor --> Aktif: İptal

    Aktif --> RolDeğişiyor: Admin Rol Değiştir
    RolDeğişiyor --> AdminUser: Role = ADMIN
    RolDeğişiyor --> NormalUser: Role = USER
    AdminUser --> Aktif: Rol Atandı
    NormalUser --> Aktif: Rol Atandı

    Aktif --> Siliniyor: Admin Sil
    Siliniyor --> Silindi: Onay
    Siliniyor --> Aktif: İptal
    
    Silindi --> [*]
```
