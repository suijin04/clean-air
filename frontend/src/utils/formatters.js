export function formatTimestamp(isoString) {
  if (!isoString) return "Recently updated";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "Recently updated";
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return "Recently updated";
  }
}

export function formatRelativeTime(isoString) {
  if (!isoString) return "Recently";
  try {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins === 1) return "1 min ago";
    if (diffMins < 60) return `${diffMins} min ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours === 1) return "1 hr ago";
    if (diffHours < 24) return `${diffHours} hrs ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  } catch {
    return "Recently";
  }
}

export function getPollutantDetails(key) {
  const meta = {
    pm25: {
      label: "PM2.5",
      subscript: "2.5",
      name: "Fine Particulate Matter",
      description: "Fine inhalable particles with diameters 2.5 micrometers and smaller. Capable of reaching deep into the lungs.",
      standardThreshold: "35 µg/m³ (24-hr standard)"
    },
    pm10: {
      label: "PM10",
      subscript: "10",
      name: "Inhalable Particles",
      description: "Respirable particles such as dust, pollen, and smoke up to 10 micrometers in diameter.",
      standardThreshold: "150 µg/m³ (24-hr standard)"
    },
    no2: {
      label: "NO₂",
      subscript: "2",
      name: "Nitrogen Dioxide",
      description: "Formed from vehicle combustion and power plants. Can cause inflammation of airways.",
      standardThreshold: "100 ppb (1-hr standard)"
    },
    so2: {
      label: "SO₂",
      subscript: "2",
      name: "Sulfur Dioxide",
      description: "Gas produced by burning fossil fuels containing sulfur (coal and oil) and industrial smelting.",
      standardThreshold: "75 ppb (1-hr standard)"
    },
    co: {
      label: "CO",
      subscript: "",
      name: "Carbon Monoxide",
      description: "Colorless, odorless gas emitted by incomplete combustion in motor engines and heaters.",
      standardThreshold: "9 ppm (8-hr standard)"
    },
    o3: {
      label: "O₃",
      subscript: "3",
      name: "Ground-level Ozone",
      description: "Secondary pollutant created by chemical reactions between oxides of nitrogen (NOx) and VOCs under sunlight.",
      standardThreshold: "70 ppb (8-hr standard)"
    }
  };

  const cleanKey = key.toLowerCase().replace(".", "");
  return meta[cleanKey] || {
    label: key.toUpperCase(),
    subscript: "",
    name: key,
    description: "Criteria atmospheric pollutant.",
    standardThreshold: "Standard threshold"
  };
}
