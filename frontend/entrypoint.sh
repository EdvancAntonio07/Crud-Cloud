#!/bin/sh
# entrypoint.sh - Obtiene metadata de AWS ECS antes de iniciar Nginx

INFO_FILE="/usr/share/nginx/html/frontend-info.json"

# Valores por defecto (local)
IP="127.0.0.1"
AZ="local"
TASK_ID=$HOSTNAME
IS_ECS=false

# Si estamos dentro de Fargate, AWS inyecta esta variable
if [ -n "$ECS_CONTAINER_METADATA_URI_V4" ]; then
    IS_ECS=true
    
    # Descargar la metadata del endpoint interno de ECS
    META=$(wget -qO- $ECS_CONTAINER_METADATA_URI_V4/task)
    
    # Extraer los datos usando grep y cut (muy básico porque Alpine no trae jq por defecto)
    IP=$(echo "$META" | grep -o '"IPv4Addresses":["[^"]*"' | cut -d'"' -f4 | head -n 1)
    AZ=$(echo "$META" | grep -o '"AvailabilityZone":"[^"]*"' | cut -d'"' -f4)
    TASK_ARN=$(echo "$META" | grep -o '"TaskARN":"[^"]*"' | cut -d'"' -f4)
    
    # El Task ARN es largo, nos quedamos solo con la parte final (el ID real)
    TASK_ID=${TASK_ARN##*/}
fi

# Generamos el JSON de respuesta
cat <<EOF > $INFO_FILE
{
  "ok": true,
  "nodo": {
    "sistema": {
      "hostname": "$HOSTNAME",
      "ip_privada": "$IP",
      "os": "Nginx Alpine"
    },
    "aws_ecs": {
      "ejecutando_en_ecs": $IS_ECS,
      "tarea_id": "$TASK_ID",
      "zona_disponibilidad": "$AZ",
      "cluster": "Frontend Cluster"
    }
  }
}
EOF

# Iniciar Nginx en primer plano (reemplazando este script)
exec nginx -g "daemon off;"
