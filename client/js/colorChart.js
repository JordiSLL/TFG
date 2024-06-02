/*Color de totes les emocions, perque sempre tinguin el mateix color*/ 
var emotionColors = {
    "Enthusiasm": 'rgba(255, 99, 132, 0.5)', // Rojo claro
    "Satisfaction": 'rgba(54, 162, 235, 0.5)', // Azul claro
    "Interest": 'rgba(255, 206, 86, 0.5)', // Amarillo
    "Admiration": 'rgba(75, 192, 192, 0.5)', // Turquesa
    "Excitement": 'rgba(153, 102, 255, 0.5)', // Violeta claro
    "Aesthetic Appreciation": 'rgba(255, 159, 64, 0.5)', // Naranja
    "Surprise (positive)": 'rgba(255, 99, 71, 0.5)', // Tomate
    "Joy": 'rgba(144, 238, 144, 0.5)', // Verde claro
    "Contentment": 'rgba(32, 178, 170, 0.5)', // Verde medio
    "Triumph": 'rgba(255, 215, 0, 0.5)', // Oro
    "Amusement": 'rgba(218, 165, 32, 0.5)', // Amarillo dorado
    "Awe": 'rgba(135, 206, 250, 0.5)', // Azul cielo
    "Pride": 'rgba(240, 230, 140, 0.5)', // Caqui
    "Contemplation": 'rgba(173, 216, 230, 0.5)', // Azul claro
    "Entrancement": 'rgba(255, 228, 196, 0.5)', // Beige
    "Adoration": 'rgba(255, 20, 147, 0.5)', // Rosa profundo
    "Concentration": 'rgba(72, 61, 139, 0.5)', // Azul oscuro
    "Confusion": 'rgba(128, 128, 128, 0.5)', // Gris
    "Realization": 'rgba(255, 218, 185, 0.5)', // Durazno
    "Ecstasy": 'rgba(255, 105, 180, 0.5)', // Rosa caliente
    "Nostalgia": 'rgba(255, 160, 122, 0.5)', // Salmón claro
    "Gratitude": 'rgba(50, 205, 50, 0.5)', // Verde lima
    "Determination": 'rgba(0, 128, 0, 0.5)', // Verde
    "Calmness": 'rgba(0, 206, 209, 0.5)', // Cian oscuro
    "Contempt": 'rgba(139, 0, 0, 0.5)', // Rojo oscuro
    "Surprise (negative)": 'rgba(210, 105, 30, 0.5)', // Chocolate
    "Disapproval": 'rgba(165, 42, 42, 0.5)', // Marrón
    "Disappointment": 'rgba(128, 0, 128, 0.5)', // Púrpura
    "Sarcasm": 'rgba(255, 69, 0, 0.5)', // Rojo anaranjado
    "Love": 'rgba(255, 182, 193, 0.5)', // Rosa claro
    "Annoyance": 'rgba(255, 0, 255, 0.5)', // Fucsia
    "Relief": 'rgba(34, 139, 34, 0.5)', // Verde bosque
    "Boredom": 'rgba(128, 128, 0, 0.5)', // Verde oliva
    "Craving": 'rgba(255, 228, 181, 0.5)', // Maíz claro
    "Doubt": 'rgba(245, 222, 179, 0.5)', // Trigo
    "Awkwardness": 'rgba(244, 164, 96, 0.5)', // Arenisca
    "Disgust": 'rgba(85, 107, 47, 0.5)', // Verde oliva oscuro
    "Desire": 'rgba(255, 127, 80, 0.5)', // Coral
    "Envy": 'rgba(0, 100, 0, 0.5)', // Verde oscuro
    "Sympathy": 'rgba(255, 250, 205, 0.5)', // Amarillo claro
    "Shame": 'rgba(220, 20, 60, 0.5)', // Carmesí
    "Embarrassment": 'rgba(250, 128, 114, 0.5)', // Salmón
    "Empathic Pain": 'rgba(70, 130, 180, 0.5)', // Acero
    "Anger": 'rgba(255, 0, 0, 0.5)', // Rojo
    "Sadness": 'rgba(0, 0, 255, 0.5)', // Azul
    "Distress": 'rgba(0, 191, 255, 0.5)', // Azul profundo
    "Romance": 'rgba(255, 105, 180, 0.5)', // Rosa brillante
    "Anxiety": 'rgba(138, 43, 226, 0.5)', // Azul medio
    "Tiredness": 'rgba(112, 128, 144, 0.5)', // Gris pizarra
    "Pain": 'rgba(169, 169, 169, 0.5)', // Gris oscuro
    "Horror": 'rgba(128, 0, 0, 0.5)', // Marrón oscuro
    "Guilt": 'rgba(105, 105, 105, 0.5)', // Gris pizarra oscuro
    "Fear": 'rgba(75, 0, 130, 0.5)' // Índigo
};

var emotionBorderColors = {
    "Enthusiasm": 'rgba(255, 69, 100, 0.5)', // Rojo oscuro
    "Satisfaction": 'rgba(34, 132, 205, 0.5)', // Azul oscuro
    "Interest": 'rgba(255, 176, 56, 0.5)', // Amarillo oscuro
    "Admiration": 'rgba(55, 162, 162, 0.5)', // Turquesa oscuro
    "Excitement": 'rgba(133, 72, 225, 0.5)', // Violeta oscuro
    "Aesthetic Appreciation": 'rgba(255, 129, 34, 0.5)', // Naranja oscuro
    "Surprise (positive)": 'rgba(255, 69, 41, 0.5)', // Tomate oscuro
    "Joy": 'rgba(114, 208, 114, 0.5)', // Verde oscuro
    "Contentment": 'rgba(2, 148, 140, 0.5)', // Verde medio oscuro
    "Triumph": 'rgba(255, 185, 0, 0.5)', // Oro oscuro
    "Amusement": 'rgba(188, 135, 2, 0.5)', // Amarillo dorado oscuro
    "Awe": 'rgba(105, 176, 220, 0.5)', // Azul cielo oscuro
    "Pride": 'rgba(210, 200, 110, 0.5)', // Caqui oscuro
    "Contemplation": 'rgba(143, 186, 200, 0.5)', // Azul claro oscuro
    "Entrancement": 'rgba(225, 198, 166, 0.5)', // Beige oscuro
    "Adoration": 'rgba(225, 0, 117, 0.5)', // Rosa profundo oscuro
    "Concentration": 'rgba(42, 31, 109, 0.5)', // Azul oscuro profundo
    "Confusion": 'rgba(98, 98, 98, 0.5)', // Gris oscuro
    "Realization": 'rgba(225, 188, 155, 0.5)', // Durazno oscuro
    "Ecstasy": 'rgba(225, 75, 150, 0.5)', // Rosa caliente oscuro
    "Nostalgia": 'rgba(225, 130, 92, 0.5)', // Salmón claro oscuro
    "Gratitude": 'rgba(20, 175, 20, 0.5)', // Verde lima oscuro
    "Determination": 'rgba(0, 98, 0, 0.5)', // Verde oscuro
    "Calmness": 'rgba(0, 176, 179, 0.5)', // Cian oscuro profundo
    "Contempt": 'rgba(109, 0, 0, 0.5)', // Rojo oscuro profundo
    "Surprise (negative)": 'rgba(180, 75, 0, 0.5)', // Chocolate oscuro
    "Disapproval": 'rgba(135, 12, 12, 0.5)', // Marrón oscuro
    "Disappointment": 'rgba(98, 0, 98, 0.5)', // Púrpura oscuro
    "Sarcasm": 'rgba(225, 39, 0, 0.5)', // Rojo anaranjado oscuro
    "Love": 'rgba(225, 152, 163, 0.5)', // Rosa claro oscuro
    "Annoyance": 'rgba(225, 0, 225, 0.5)', // Fucsia oscuro
    "Relief": 'rgba(4, 109, 4, 0.5)', // Verde bosque oscuro
    "Boredom": 'rgba(98, 98, 0, 0.5)', // Verde oliva oscuro
    "Craving": 'rgba(225, 198, 151, 0.5)', // Maíz claro oscuro
    "Doubt": 'rgba(215, 192, 149, 0.5)', // Trigo oscuro
    "Awkwardness": 'rgba(214, 134, 66, 0.5)', // Arenisca oscuro
    "Disgust": 'rgba(55, 77, 17, 0.5)', // Verde oliva oscuro profundo
    "Desire": 'rgba(225, 97, 50, 0.5)', // Coral oscuro
    "Envy": 'rgba(0, 70, 0, 0.5)', // Verde oscuro profundo
    "Sympathy": 'rgba(225, 220, 175, 0.5)', // Amarillo claro oscuro
    "Shame": 'rgba(190, 0, 30, 0.5)', // Carmesí oscuro
    "Embarrassment": 'rgba(220, 98, 84, 0.5)', // Salmón oscuro
    "Empathic Pain": 'rgba(40, 100, 150, 0.5)', // Acero oscuro
    "Anger": 'rgba(225, 0, 0, 0.5)', // Rojo oscuro
    "Sadness": 'rgba(0, 0, 225, 0.5)', // Azul oscuro
    "Distress": 'rgba(0, 161, 225, 0.5)', // Azul profundo oscuro
    "Romance": 'rgba(225, 75, 150, 0.5)', // Rosa brillante oscuro
    "Anxiety": 'rgba(108, 13, 196, 0.5)', // Azul medio oscuro
    "Tiredness": 'rgba(82, 98, 114, 0.5)', // Gris pizarra oscuro
    "Pain": 'rgba(139, 139, 139, 0.5)', // Gris oscuro oscuro
    "Horror": 'rgba(98, 0, 0, 0.5)', // Marrón oscuro profundo
    "Guilt": 'rgba(75, 75, 75, 0.5)', // Gris pizarra oscuro profundo
    "Fear": 'rgba(45, 0, 100, 0.5)' // Índigo oscuro
};
