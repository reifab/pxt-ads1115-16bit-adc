const ADS1115_GND_ADDRESS = 0x48    // ADDR pin connect to GDN
const ADS1115_VDD_ADDRESS = 0x49    // ADDR pin connect to VDD
const ADS1115_SDA_ADDRESS = 0x4A    // ADDR pin connect to SDA
const ADS1115_SCL_ADDRESS = 0x4B    // ADDR pin connect to SCL

const ADS1115_CONVERSIONDELAY = 300
const ADS1115_POINTER_MASK = 0x03
const ADS1115_POINTER_CONVERT = 0x00
const ADS1115_POINTER_CONFIG = 0x01
const ADS1115_POINTER_LOWTHRESH = 0x02
const ADS1115_POINTER_HITHRESH = 0x03

const ADS1115_OS_MASK = 0x8000         // Operational status/single-shot conversion start
const ADS1115_OS_NOEFFECT = 0x0000     // Write: Bit = 0
const ADS1115_OS_SINGLE = 0x8000       // Write: Bit = 1
const ADS1115_OS_BUSY = 0x0000         // Read: Bit = 0
const ADS1115_OS_NOTBUSY = 0x8000      // Read: Bit = 1

const ADS1115_MUX_MASK = 0x7000   // Input multiplexer configuration
const ADS1115_MUX_0_1 = 0x0000    // P = AIN0, N = AIN1(default)
const ADS1115_MUX_0_3 = 0x1000    // P = AIN0, N = AIN3
const ADS1115_MUX_1_3 = 0x2000    // P = AIN1, N = AIN3
const ADS1115_MUX_2_3 = 0x3000    // P = AIN2, N = AIN3
const ADS1115_MUX_0_G = 0x4000    // P = AIN0, N = GND
const ADS1115_MUX_1_G = 0x5000    // P = AIN1, N = GND
const ADS1115_MUX_2_G = 0x6000    // P = AIN2, N = GND
const ADS1115_MUX_3_G = 0x7000    // P = AIN3, N = GND

const ADS1115_PGA_MASK = 0x0E00    // Programmable gain amplifier configuration
const ADS1115_PGA_6_144 = 0x0000   // 6.144V 
const ADS1115_PGA_4_096 = 0x0200   // 4.096V 
const ADS1115_PGA_2_048 = 0x0400   // 2.048V (default)
const ADS1115_PGA_1_024 = 0x0600   // 1.024V 
const ADS1115_PGA_0_512 = 0x0800   // 0.512V 
const ADS1115_PGA_0_256 = 0x0E00   // 0.256V 

const ADS1115_MODE_MASK = 0x0100    // Device operating mode
const ADS1115_MODE_CONTIN = 0x0000  // Continuous conversion mode
const ADS1115_MODE_SINGLE = 0x0100  // Power-down single-shot mode (default)

const ADS1115_DR_MASK = 0x00E0  // Data rate(samples per second)
const ADS1115_DR_8 = 0x0000     // 8 SPS
const ADS1115_DR_16 = 0x0020    // 16 SPS
const ADS1115_DR_32 = 0x0040    // 32 SPS
const ADS1115_DR_64 = 0x0060    // 64 SPS
const ADS1115_DR_128 = 0x0080   // 128 SPS (default)
const ADS1115_DR_250 = 0x00A0   // 250 SPS
const ADS1115_DR_475 = 0x00C0   // 475 SPS
const ADS1115_DR_860 = 0x00E0   // 860 SPS

const ADS1115_COMP_MODE_MASK = 0x0010    // Comparator mode
const ADS1115_COMP_MODE_TRAD = 0x0000    // Traditional comparator with hysteresis (default)
const ADS1115_COMP_MODE_WINDOW = 0x0010  // Window comparator

const ADS1115_COMP_POL_MASK = 0x0008    // Comparator polarity
const ADS1115_COMP_POL_ACTVLOW = 0x0000 // Active low(default)
const ADS1115_COMP_POL_ACTVHIGH = 0x0008// Active high

const ADS1115_COMP_LAT_MASK = 0x0004    // Latching comparator
const ADS1115_COMP_LAT_NONLAT = 0x0000  // Non-latching comparator (default)
const ADS1115_COMP_LAT_LATCH = 0x0004   // Latching comparator

const ADS1115_COMP_QUE_MASK = 0x0003    // Comparator queue and disable
const ADS1115_COMP_QUE_1CONV = 0x0000   // After one conversions
const ADS1115_COMP_QUE_2CONV = 0x0001   // After two conversions
const ADS1115_COMP_QUE_4CONV = 0x0002   // After four conversions
const ADS1115_COMP_QUE_NONE = 0x0003    // Disable the comparator(default)

const ADS1115_DEFAULT_CONFIG = 0x8583    //Default content in config register

class ADS1115 {
    _configRegister: number;
    _i2cAddress: number;
    _channelToMUX: Array<number>;
    _numberFormat: NumberFormat;
    _gain: number;

    constructor() {
        this._numberFormat = NumberFormat.UInt8BE
        this._i2cAddress = ADS1115_GND_ADDRESS
        this._configRegister = 0
        this._gain = Gain.PGA_6_144
        this._channelToMUX = [ADS1115_MUX_0_G, ADS1115_MUX_1_G, ADS1115_MUX_2_G,
            ADS1115_MUX_3_G, ADS1115_MUX_0_1, ADS1115_MUX_0_3, ADS1115_MUX_1_3, ADS1115_MUX_2_3];
    }

    writeRegister(reg: number, value: number): void {
        let buf = pins.createBuffer(3);
        buf.setNumber(this._numberFormat, 0, reg);
        buf.setNumber(this._numberFormat, 1, value >> 8);
        buf.setNumber(this._numberFormat, 2, value & 0xFF);
        pins.i2cWriteBuffer(this._i2cAddress, buf, false);
    }

    readRegister(reg: number): NumberFormat.Int16LE {
        let buf: Buffer
        let returnValue: NumberFormat.Int16LE
        pins.i2cWriteNumber(this._i2cAddress, reg, this._numberFormat)
        buf = pins.i2cReadBuffer(this._i2cAddress, 2)
        returnValue = (buf.getUint8(0) << 8 | buf.getUint8(1))
        return returnValue
    }

    begin(i2cAddress: number = ADS1115_GND_ADDRESS): void {
        this._i2cAddress = i2cAddress;
    }

    setOperateMode(operateMode: number): void {
        operateMode &= ADS1115_MODE_MASK;
        this._configRegister &= ~ADS1115_MODE_MASK;
        this._configRegister |= operateMode;
    }

    setOperateStaus(operateStaus: number): void {
        operateStaus &= ADS1115_OS_MASK;
        this._configRegister &= ~ADS1115_OS_MASK;
        this._configRegister |= operateStaus;
    };

    setPGAGain(PGAGain: number): void {
        PGAGain &= ADS1115_PGA_MASK;
        this._configRegister &= ~ADS1115_PGA_MASK;
        this._configRegister |= PGAGain;
        this._gain = PGAGain;
    };

    getPGAGain(): number {
        switch(this._gain){
            case Gain.PGA_6_144:
                return 0.1875;
                break;
            case Gain.PGA_4_096:
                return 0.125;
                break;
            case Gain.PGA_2_048:
                return 0.0625;
                break;
            case Gain.PGA_1_024:
                return 0.03125;
                break;
            case Gain.PGA_0_512:
                return 0.015625;
                break;
            case Gain.PGA_0_256:
                return 0.0078125;
                break;
            default:
                return 0;    
        }
    };

    setSampleRate(SampleRate: number): void {
        SampleRate &= ADS1115_DR_MASK;
        this._configRegister &= ~ADS1115_DR_MASK;
        this._configRegister |= SampleRate;
    };

    setInputMux(InputMux: number): void {
        InputMux &= ADS1115_MUX_MASK;
        this._configRegister &= ~ADS1115_MUX_MASK;
        this._configRegister |= InputMux;
    };

    uncomplement(val: number, bitwidth: number) {
        let isnegative = val & (1 << (bitwidth - 1));
        let boundary = (1 << bitwidth);
        let minval = -boundary;
        let mask = boundary - 1;
        return isnegative ? minval + (val & mask) : val;
    }

    getConversionResults(channel: number): NumberFormat.Int16LE {
        let ret_val: NumberFormat.Int16LE
        this.setInputMux(this._channelToMUX[channel]);
        this.writeRegister(ADS1115_POINTER_CONFIG, this._configRegister);
        basic.pause(ADS1115_CONVERSIONDELAY / (((this._configRegister & ADS1115_DR_MASK) >> 5) + 1));
        ret_val = this.readRegister(ADS1115_POINTER_CONVERT);
        ret_val = this.uncomplement(ret_val, 16);
        if (channel < 4 && ret_val < 0) ret_val = 0;
        return (ret_val);
    };
}

enum OperateModes {
    //% block="CONTINUS"
    CONTIN = ADS1115_MODE_CONTIN,    // Continuous conversion mode
    //% block="SINGLE"
    SINGLE = ADS1115_MODE_SINGLE    // Power-down single-shot mode (default)
}

enum OperateStatus {
    //% block="SINGLE"
    SINGLE = ADS1115_OS_SINGLE,// Write: Bit = 1
    //% block="NOEFFECT"
    NOEFFECT = ADS1115_OS_NOEFFECT,
    //% block="BUSY"    
    BUSY = ADS1115_OS_BUSY,
    //% block="NOTBUSY"    
    NOTBUSY = ADS1115_OS_NOTBUSY,
}

enum Gain {
    //% block="PGA 6.144 V"
    PGA_6_144 = ADS1115_PGA_6_144,
    //% block="PGA 4.096 V"   
    PGA_4_096 = ADS1115_PGA_4_096,
    //% block="PGA 2.048 V"
    PGA_2_048 = ADS1115_PGA_2_048,
    //% block="PGA 1.024 V"
    PGA_1_024 = ADS1115_PGA_1_024,
    //% block="PGA 0.512 V"
    PGA_0_512 = ADS1115_PGA_0_512,
    //% block="PGA 0.256 V"
    PGA_0_256 = ADS1115_PGA_0_256
}
enum SampligRate {
    //% block="DR_8"
    DR_8 = ADS1115_DR_8,
    //% block="DR_16"
    DR_16 = ADS1115_DR_16,    
    //% block="DR_32"
    DR_32 = ADS1115_DR_32,
    //% block="DR_64"
    DR_64 = ADS1115_DR_64,    
    //% block="DR_128"
    DR_128 = ADS1115_DR_128,   
    //% block="DR_250"
    DR_250 = ADS1115_DR_250,
    //% block="DR_475"
    DR_475 = ADS1115_DR_475,
    //% block="DR_860"
    DR_860 = ADS1115_DR_860 // 860 SPS
}

enum Channel {
    //% block="CH0"
    channel0 = 0,
    //% block="CH1"
    channel1
}

/**
 * Custom blocks
 */
//% block=16BitADC
//% weight=100 color=#0fbc11 icon=""
namespace adc {
    const CHANNELNUMS = 8   //channel number
    let ads = new ADS1115();

    /**
     * Setzt die I2C Adresse. Standard: 0x48
     * @param i2CAddress I2C Adresse
     */
    //% block 
    //%i2cAddress.defl=0x48
    export function setI2CAddress(i2CAddress: number): void {
        ads.begin(i2CAddress)
    }

    /**
     * Setzt den Betriebsmodus
     * @param operateMode Betriebsmodus
     */
    //% block
    export function setOperateMode(operateMode: OperateModes): void {
        ads.setOperateMode(operateMode);
    }

    /**
     * Setzt den Betriebsstatus
     * @param operateStatus Betriebsstatus
     */
    //% block
    export function setOperateStatus(operateStatus: OperateStatus): void {
        ads.setOperateStaus(operateStatus);
    }

    /**
     * Setzt die Verstärung (Gain)
     * @param gain Verstärkung
     */
    //% block
    export function setPGAGain(gain: Gain): void {
        ads.setPGAGain(gain);
    }

    /**
     * Setzt die Abtastrate
     * @param sr Samplingrate
     */
    //% block
    export function setSampleRate(sr: SampligRate): void {
        ads.setSampleRate(sr);
    }

    /**
     * Liest einen 16 Bit Wert vom ADC
     * @param ch Kanal
     */
    //% block
    export function getConversionResults(ch: Channel): number {
        return ads.getConversionResults(ch);
    }

    /**
    * Liest die Spannung an einem gewüschten Kanal.
    * Es wird 10x gemessen und der Mittelwert ausgegeben.
    * @param ch Kanal
    */
    //% block
    export function getConversionResultsInVolts(ch: Channel): number {
        let adcValue: number = 0
        let voltage: number
        let numberOfLoops: number
        numberOfLoops = 10
        adcValue = 0;
        for (let i = 0; i < numberOfLoops; i++) {
            adcValue += ads.getConversionResults(ch);
        }        
        adcValue = adcValue / numberOfLoops;
        voltage = adcValue * ads.getPGAGain() / 1000
        return voltage;
    }
}