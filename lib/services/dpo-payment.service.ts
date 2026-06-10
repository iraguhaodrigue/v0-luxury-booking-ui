/**
 * DPO Group Payment Integration Service
 * Handles all payment processing for KILUVA marketplace
 */

interface DPOToken {
  transToken: string
}

interface DPOPayment {
  transactionToken: string
  amount: number
  currency: string
  description: string
  customerEmail: string
  customerName: string
  bookingId: number
  callbackUrl: string
}

interface DPOVerification {
  status: string
  transactionToken: string
  amount: number
  currency: string
}

const DPO_API_BASE = 'https://secure1.dpogroup.com/payv3/API/v7'
const DPO_COMPANY_TOKEN = process.env.DPO_COMPANY_TOKEN || ''

export const dpoPaymentService = {
  /**
   * Create a payment token with DPO
   */
  async createPaymentToken(payment: DPOPayment): Promise<DPOToken> {
    try {
      const payload = `<?xml version="1.0" encoding="utf-8"?>
        <API3G>
          <CompanyToken>${DPO_COMPANY_TOKEN}</CompanyToken>
          <Request>
            <Transaction>
              <CompanyRef>${payment.bookingId}</CompanyRef>
              <Amount>${(payment.amount * 100).toFixed(0)}</Amount>
              <Currency>${payment.currency}</Currency>
              <Description>${payment.description}</Description>
              <DefaultPayment>CC</DefaultPayment>
              <RedirectURL>${payment.callbackUrl}</RedirectURL>
              <BackURL>${payment.callbackUrl}?cancelled=true</BackURL>
              <Customer>
                <Email>${payment.customerEmail}</Email>
                <FirstName>${payment.customerName.split(' ')[0]}</FirstName>
                <LastName>${payment.customerName.split(' ').slice(1).join(' ')}</LastName>
              </Customer>
            </Transaction>
          </Request>
        </API3G>`

      const response = await fetch(`${DPO_API_BASE}/Transaction`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: payload,
      })

      const text = await response.text()
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(text, 'text/xml')

      const transToken = xmlDoc.querySelector('TransToken')?.textContent
      if (!transToken) {
        throw new Error('Failed to create payment token')
      }

      return { transactionToken: transToken }
    } catch (error) {
      console.error('[v0] DPO token creation error:', error)
      throw error
    }
  },

  /**
   * Get payment status from DPO
   */
  async verifyPayment(transactionToken: string): Promise<DPOVerification> {
    try {
      const payload = `<?xml version="1.0" encoding="utf-8"?>
        <API3G>
          <CompanyToken>${DPO_COMPANY_TOKEN}</CompanyToken>
          <Request>
            <TransactionToken>${transactionToken}</TransactionToken>
          </Request>
        </API3G>`

      const response = await fetch(`${DPO_API_BASE}/TransactionStatus`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/xml',
        },
        body: payload,
      })

      const text = await response.text()
      const parser = new DOMParser()
      const xmlDoc = parser.parseFromString(text, 'text/xml')

      const status = xmlDoc.querySelector('Status')?.textContent || 'UNKNOWN'
      const amount = xmlDoc.querySelector('Amount')?.textContent || '0'
      const currency = xmlDoc.querySelector('Currency')?.textContent || 'USD'

      return {
        status,
        transactionToken,
        amount: parseInt(amount) / 100,
        currency,
      }
    } catch (error) {
      console.error('[v0] DPO verification error:', error)
      throw error
    }
  },

  /**
   * Get payment redirect URL
   */
  getPaymentUrl(transactionToken: string): string {
    return `${DPO_API_BASE}/TransactionToken=${transactionToken}`
  },
}
