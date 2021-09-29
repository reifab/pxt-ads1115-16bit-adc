// Gib deinen Code hier ein
adc.setI2CAddress(72)
adc.setOperateStatus(OperateStatus.SINGLE)
adc.setOperateMode(OperateModes.SINGLE)
adc.setSampleRate(SampligRate.DR_860)
adc.setPGAGain(Gain.PGA_4_096)
basic.forever(function () {
    serial.writeValue("ADC-Wert", adc.getConversionResultsInVolts(Channel.channel0))
})