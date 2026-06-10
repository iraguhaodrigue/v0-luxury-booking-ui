# KILUVA Marketplace - Deployment & Production Guide

## Pre-Deployment Checklist

### Environment Variables
Ensure all required environment variables are set in your Vercel project:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[project].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-service-role-key]

# DPO Group (when ready)
DPO_GROUP_API_KEY=your_api_key
DPO_GROUP_COMPANY_TOKEN=your_token
DPO_GROUP_SERVICE_TYPE=your_service_type

# Email Service (SendGrid, Mailgun, etc.)
EMAIL_SERVICE_KEY=your_email_service_key
SMTP_FROM_EMAIL=noreply@kiluva.com

# Optional: Analytics
NEXT_PUBLIC_ANALYTICS_ID=your_analytics_id

# Optional: Map Integration
NEXT_PUBLIC_MAPBOX_TOKEN=your_mapbox_token
```

### Database Migration

1. **Connect to Supabase**:
   ```bash
   supabase login
   supabase link --project-ref [your-project-ref]
   ```

2. **Run Migrations**:
   ```bash
   supabase migration up
   ```

3. **Verify Schema**:
   - Check all tables exist in Supabase dashboard
   - Verify RLS policies are enabled
   - Test data access with test user

### Build & Test Locally

```bash
# Install dependencies
npm install

# Run type check
npm run type-check

# Build for production
npm run build

# Test production build locally
npm start
```

## Deployment to Vercel

### Option 1: GitHub Integration (Recommended)

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "feat: Complete KILUVA marketplace implementation"
   git push origin main
   ```

2. **Connect to Vercel**:
   - Go to https://vercel.com/new
   - Select your GitHub repository
   - Import project

3. **Configure Environment**:
   - Add all environment variables in Vercel dashboard
   - Set Production environment
   - Deploy

### Option 2: Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... add all other variables

# Re-deploy with env vars
vercel --prod
```

## Post-Deployment

### 1. Verify Deployment
- [ ] Homepage loads correctly
- [ ] Search functionality works
- [ ] Booking flow completes
- [ ] Admin dashboard accessible
- [ ] Messaging system operational
- [ ] Database queries working

### 2. Performance Monitoring
```bash
# Check Core Web Vitals
vercel analytics show

# View deployment logs
vercel logs --prod
```

### 3. Database Monitoring
- Monitor Supabase CPU and memory usage
- Check query performance
- Review RLS policy effectiveness
- Set up automated backups

### 4. Security Hardening

#### API Route Protection
```typescript
// All API routes should verify user
const { data: { user } } = await supabase.auth.getUser()
if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

#### RLS Policy Verification
```sql
-- Test RLS policies
SELECT * FROM properties WHERE id = 1;
-- Should only return if user has access
```

#### CORS Configuration
```typescript
// In API routes, set proper headers
response.headers.set('Content-Type', 'application/json')
response.headers.set('Access-Control-Allow-Origin', 'https://yourdomain.com')
```

### 5. Set Up Monitoring

#### Sentry Integration (Error Tracking)
```bash
npm install @sentry/nextjs
```

```typescript
// sentry.server.config.ts
import * as Sentry from "@sentry/nextjs"

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0,
})
```

#### PostHog Integration (Analytics)
```bash
npm install posthog-js
```

```typescript
// lib/analytics/posthog.ts
import posthog from 'posthog-js'

export const initPostHog = () => {
  posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY!, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
    loaded: (ph) => {
      if (process.env.NODE_ENV === 'development') ph.debug()
    },
  })
}
```

### 6. Email Notifications Setup

#### SendGrid Example
```bash
npm install @sendgrid/mail
```

```typescript
// lib/email/sendgrid.ts
import sgMail from '@sendgrid/mail'

export async function sendBookingConfirmation(email: string, bookingId: string) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY!)
  
  await sgMail.send({
    to: email,
    from: process.env.SMTP_FROM_EMAIL!,
    subject: 'Booking Confirmation',
    html: `<p>Your booking ${bookingId} has been confirmed</p>`,
  })
}
```

### 7. Implement Payment Processing

#### DPO Group Integration
```typescript
// lib/payment/dpo-group.ts
export async function createPaymentToken(bookingId: string, amount: number) {
  const response = await fetch('https://secure.3gdirectpay.com/API/v6/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      CompanyToken: process.env.DPO_GROUP_COMPANY_TOKEN!,
      Request: 'createToken',
      BookingID: bookingId,
      Amount: String(amount * 100),
      Currency: 'ZAR',
      // ... other required fields
    }),
  })
  
  return response.json()
}
```

## Scaling Considerations

### Database Optimization
- Enable Supabase read replicas for high-traffic regions
- Implement caching layer with Redis (Upstash)
- Use connection pooling for database connections
- Monitor slow queries in Supabase dashboard

### CDN & Static Assets
- Enable Vercel's Edge Caching
- Use Image Optimization
- Serve assets from CDN
- Compress static files

### Rate Limiting
```typescript
// lib/middleware/rate-limit.ts
import { Ratelimit } from '@upstash/ratelimit'

const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(10, '1 h'),
})

export async function checkRateLimit(userId: string) {
  const result = await ratelimit.limit(userId)
  return result.success
}
```

### Load Testing
```bash
# Test with artillery
npm install -D artillery

# Run load test
artillery quick --count 100 --num 1000 https://yourdomain.com
```

## Maintenance & Updates

### Weekly Tasks
- [ ] Review Sentry error logs
- [ ] Check analytics for anomalies
- [ ] Monitor Supabase usage
- [ ] Review support tickets

### Monthly Tasks
- [ ] Update dependencies
- [ ] Review security updates
- [ ] Optimize slow queries
- [ ] Analyze user behavior
- [ ] Plan feature updates

### Quarterly Tasks
- [ ] Load testing
- [ ] Security audit
- [ ] Performance review
- [ ] Disaster recovery drill
- [ ] Capacity planning

## Troubleshooting

### Database Connection Issues
```bash
# Test Supabase connection
supabase status

# Check RLS policies
supabase db push
```

### Build Failures
```bash
# Clear cache and rebuild
vercel --prod --force
```

### Performance Issues
- Check Vercel Analytics
- Review Supabase slow queries
- Analyze bundle size
- Implement caching strategies

## Backup & Disaster Recovery

### Automated Backups
- Supabase provides daily backups (included in plan)
- Store backups in S3 or Google Cloud Storage

### Manual Backup
```bash
# Export database
pg_dump postgresql://[connection-string] > backup.sql

# Store in secure location
gsutil cp backup.sql gs://your-bucket/
```

### Recovery Procedure
1. Restore from Supabase backup if available
2. Or restore from exported SQL file
3. Run migrations to verify schema
4. Test with read-only queries first
5. Validate data integrity

## Success Metrics

### Key Performance Indicators
- **Page Load Time**: Target < 3 seconds
- **Booking Success Rate**: Target > 95%
- **API Response Time**: Target < 200ms
- **Database Query Time**: Target < 50ms
- **Error Rate**: Target < 0.1%
- **User Engagement**: Track DAU, MAU, conversion rate

### Monitoring Dashboard
Create a custom dashboard to track:
- Real-time user activity
- Booking funnel metrics
- Payment success rates
- System health (CPU, memory, database)
- Error trends

## Production Runbook

### Daily Checks
```bash
vercel logs --prod --follow
# Monitor for errors, slow requests, deployment issues
```

### Incident Response
1. Check Sentry for error details
2. Review Supabase logs
3. Check Vercel deployment status
4. Verify database connectivity
5. Test critical user paths
6. Rollback if necessary

## Next Steps After Deployment

1. **Monitor Performance**: Set up APM (Application Performance Monitoring)
2. **Gather User Feedback**: Implement feedback widget
3. **A/B Testing**: Run experiments on booking flow
4. **SEO Optimization**: Monitor and improve rankings
5. **Payment Integration**: Finalize DPO Group setup
6. **Expand Features**: Add new property types, services, regions
7. **Mobile App**: Consider native iOS/Android apps
8. **Partnerships**: Integrate with payment platforms, travel APIs
9. **Marketing**: Launch marketing campaigns
10. **Scale Infrastructure**: Plan for growth

## Support Contacts

- **Supabase Support**: https://supabase.com/support
- **Vercel Support**: https://vercel.com/support
- **DPO Group Support**: https://www.directpay.online/support

---

**Deployment Status**: Ready for production
**Last Updated**: 2026-04-17
**Version**: 1.0.0
