export class FFT {
    constructor(size) {
        this.size = size;
        this.reverseTable = new Uint32Array(size);
        this.initReverseTable();
    }

    initReverseTable() {
        const size = this.size;
        const maxBits = Math.log2(size);
        
        for (let i = 0; i < size; i++) {
            let reversed = 0;
            let j = i;
            for (let bit = 0; bit < maxBits; bit++) {
                reversed = (reversed << 1) | (j & 1);
                j = j >> 1;
            }
            this.reverseTable[i] = reversed;
        }
    }

    fft(re, im, inverse = false) {
        const size = this.size;
        const maxBits = Math.log2(size);
        const reverseTable = this.reverseTable;

        // Bit reversal
        for (let i = 0; i < size; i++) {
            const j = reverseTable[i];
            if (j > i) {
                [re[i], re[j]] = [re[j], re[i]];
                [im[i], im[j]] = [im[j], im[i]];
            }
        }

        // Cooley-Tukey FFT
        for (let len = 2; len <= size; len <<= 1) {
            const halfLen = len >> 1;
            const angStep = (inverse ? 2 : -2) * Math.PI / len;
            
            for (let i = 0; i < size; i += len) {
                let ang = 0;
                
                for (let j = i; j < i + halfLen; j++) {
                    const cos = Math.cos(ang);
                    const sin = Math.sin(ang);
                    const k = j + halfLen;
                    
                    const reK = re[k];
                    const imK = im[k];
                    
                    const tr = reK * cos - imK * sin;
                    const ti = reK * sin + imK * cos;
                    
                    re[k] = re[j] - tr;
                    im[k] = im[j] - ti;
                    re[j] += tr;
                    im[j] += ti;
                    
                    ang += angStep;
                }
            }
        }

        // Scale if inverse transform
        if (inverse) {
            const scale = 1 / size;
            for (let i = 0; i < size; i++) {
                re[i] *= scale;
                im[i] *= scale;
            }
        }

        return { re, im };
    }

    // Helper method for 2D FFT
    fft2d(data, inverse = false) {
        const size = this.size;
        const re = new Float32Array(size * size);
        const im = new Float32Array(size * size);

        // Split complex data into real and imaginary parts
        for (let i = 0; i < size * size; i++) {
            re[i] = data[i * 2];
            im[i] = data[i * 2 + 1];
        }

        // Row-wise FFT
        for (let i = 0; i < size; i++) {
            const rowRe = new Float32Array(size);
            const rowIm = new Float32Array(size);
            
            for (let j = 0; j < size; j++) {
                const idx = i * size + j;
                rowRe[j] = re[idx];
                rowIm[j] = im[idx];
            }
            
            this.fft(rowRe, rowIm, inverse);
            
            for (let j = 0; j < size; j++) {
                const idx = i * size + j;
                re[idx] = rowRe[j];
                im[idx] = rowIm[j];
            }
        }

        // Column-wise FFT
        for (let j = 0; j < size; j++) {
            const colRe = new Float32Array(size);
            const colIm = new Float32Array(size);
            
            for (let i = 0; i < size; i++) {
                const idx = i * size + j;
                colRe[i] = re[idx];
                colIm[i] = im[idx];
            }
            
            this.fft(colRe, colIm, inverse);
            
            for (let i = 0; i < size; i++) {
                const idx = i * size + j;
                re[idx] = colRe[i];
                im[idx] = colIm[i];
            }
        }

        // Combine real and imaginary parts back into complex data
        const result = new Float32Array(size * size * 2);
        for (let i = 0; i < size * size; i++) {
            result[i * 2] = re[i];
            result[i * 2 + 1] = im[i];
        }

        return result;
    }

    // Convenience methods for the water simulation
    forward(data) {
        return this.fft2d(data, false);
    }

    inverse(data) {
        return this.fft2d(data, true);
    }
} 