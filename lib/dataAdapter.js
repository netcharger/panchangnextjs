// Helper to transform flat yearly JSON data to the section-based structure expected by DailyPanchangam
function transformFlatPanchangData(flatData) {
  // console.log('🔄 Transforming flat data:', flatData ? 'Received' : 'NULL');
  if (!flatData) return null;

  try {
    // Helper to format time range strings if needed, or pass through
  const fmt = (val) => val || "-";
  
  // Construct events for Tithi/Nakshatra/etc if they are simple strings in the flat data
  // The UI expects nested event lists for these if they are complex, but handles simple values too?
  // Let's check DailyPanchangam.jsx. It checks tithiItem?.type === "event_list".
  // If the flat data just has "thithi": "Tritiya", we might need to wrap it or adjust the UI.
  // Actually the snippet showed "thithi": "త్రయోదశి", "thithi_end": "20:47:00".
  // So we can construct a single event.

  const createSingleEvent = (name, endTime) => {
    return {
       type: "event_list",
       events: [
         { name: name, end: endTime || "" }
       ]
    };
  };

  const sections = [];

  // 1. Soorya Chandrodayalu
  sections.push({
    title: "సూర్య చంద్రోదయాలు",
    items: [
      { label: "సూర్యోదయం", value: fmt(flatData.sunrise) },
      { label: "సూర్యాస్తమయం", value: fmt(flatData.sunset) },
      { label: "చంద్రోదయం", value: fmt(flatData.moonrise) },
      { label: "చంద్రాస్తమయం", value: fmt(flatData.moonset) }
    ]
  });

  // 2. Chandra Masa Samacharam
  sections.push({
    title: "చంద్ర మాస సమాచారం",
    items: [
      { label: "మాసం", value: fmt(flatData.lunar_month) },
      { label: "పక్షం", value: fmt(flatData.paksha) },
      { label: "అయనం", value: fmt(flatData.ayanam) }, // Might be missing
      { label: "ఋతువు", value: fmt(flatData.ruthuvu) }, // Might be missing
      { label: "శకం", value: fmt(flatData.year_name) }   // Might be missing
    ]
  });

  // 3. Moola Panchangam (Tithi, Nakshatra, Yoga, Karana)
  const moolaItems = [];
  
  if (flatData.thithi) {
    moolaItems.push({
      label: "తిథులు",
      ...createSingleEvent(flatData.thithi, flatData.thithi_end)
    });
  }
  if (flatData.nakshatram) {
    moolaItems.push({
      label: "నక్షత్రాలు",
      ...createSingleEvent(flatData.nakshatram, flatData.nakshatram_end)
    });
  }
  if (flatData.yogam) {
    moolaItems.push({
      label: "యోగాలు",
      ...createSingleEvent(flatData.yogam, flatData.yogam_end)
    });
  }
  if (flatData.karanam) {
    moolaItems.push({
      label: "కరణాలు",
      ...createSingleEvent(flatData.karanam, flatData.karanam_end)
    });
  }

  sections.push({
    title: "మూల పంచాంగం",
    items: moolaItems
  });

  // 4. Auspicious Times (Shubha Samayalu)
  const auspiciousItems = [];
  if (flatData.abhijit_muhurtham) auspiciousItems.push({ label: "అభిజిత్ ముహూర్తం", value: flatData.abhijit_muhurtham });
  if (flatData.amrita_kalam) auspiciousItems.push({ label: "అమృత కాలం", value: flatData.amrita_kalam });
  if (flatData.brahma_muhurtham) auspiciousItems.push({ label: "బ్రహ్మ ముహూర్తం", value: flatData.brahma_muhurtham });
  if (flatData.vijaya_muhurtham) auspiciousItems.push({ label: "విజయ ముహూర్తం", value: flatData.vijaya_muhurtham });
  if (flatData.godhuli_muhurtham) auspiciousItems.push({ label: "గోదూలి ముహూర్తం", value: flatData.godhuli_muhurtham });
  if (flatData.pratah_sandhya) auspiciousItems.push({ label: "ప్రాతః సంధ్య", value: flatData.pratah_sandhya });
  if (flatData.sayam_sandhya) auspiciousItems.push({ label: "సాయంసాంధ్య", value: flatData.sayam_sandhya });
  
  sections.push({
    title: "శుభ సమయాలు",
    items: auspiciousItems
  });

  // 5. Inauspicious Times (Ashubha Samayalu)
  // ALWAYS add these rows so that Fixed Inauspicious Timings overlay can apply.
  const inauspiciousItems = [];
  
  // Use flatData value or "Calculated" as placeholder to trigger override
  inauspiciousItems.push({ label: "రాహుకాలం", value: flatData.rahu_kalam || "00:00 - 00:00" });
  inauspiciousItems.push({ label: "యమగండం", value: flatData.yamagandam || "00:00 - 00:00" });
  inauspiciousItems.push({ label: "గులిక కాలం", value: flatData.gulika || "00:00 - 00:00" });

  if (flatData.durmuhurtham_1) inauspiciousItems.push({ label: "దుర్ముహూర్తం", value: flatData.durmuhurtham_1 + (flatData.durmuhurtham_2 ? `, ${flatData.durmuhurtham_2}` : "") });
  if (flatData.varjyam_time) inauspiciousItems.push({ label: "వర్జ్యం", value: flatData.varjyam_time });
  
  sections.push({
    title: "అశుభ సమయాలు",
    items: inauspiciousItems
  });

  // 6. Traditional Summary (Sampradaya Panchangam)
  // Construct summary string from available parts
  const summaryParts = [
    flatData.year_name_telugu || "శ్రీ విశ్వావసు నామ సంవత్సరం", // Fallback or computed
    flatData.ayanam || "ఉత్తరాయణం",
    flatData.ruthuvu || "శిశిర ఋతువు",
    flatData.lunar_month || "మాసం"
  ];
  sections.push({
    title: "సాంప్రదాయ పంచాంగం",
    items: [
      { label: "సారాంశం", value: summaryParts.join("; ") }
    ]
  });

  // 7. Festivals
  if (flatData.festivals && flatData.festivals.length > 0) {
      sections.push({
          title: "పండుగలు",
          items: flatData.festivals.map(f => ({ label: f.festival_name, value: "" }))
      });
  }

    // console.log('✅ Transformation complete. Sections:', sections.length);
    return {
      date: flatData.date,
      sections: sections,
      _isTransformed: true
    };
  } catch (err) {
    console.error('❌ Error transforming data:', err);
    return null;
  }
}

module.exports = {
  transformFlatPanchangData
};
