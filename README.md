# Using Embeddings to Align Standards

This proof-of-concept uses [OpenAI's newest embeddings](https://openai.com/blog/new-embedding-models-and-api-updates#:~:text=Native%20support%20for%20shortening%20embeddings) to find matching standards. To learn how embeddings work, read [this summary on OpenAI's blog](https://openai.com/blog/introducing-text-and-code-embeddings). Here's two illustrations from that blog post:

![Animation showing how embeddings work](https://cdn.openai.com/new-and-improved-embedding-model/draft-20221214a/vectors-2.svg)

![Animation showing how embeddings work](https://cdn.openai.com/new-and-improved-embedding-model/draft-20221214a/vectors-3.svg)

All embeddings were create with `text-embedding-3-large` and stored 1024 dimensions.

# Where does the source data come from?

[Common Standards Project](https://www.commonstandardsproject.com), the open source repository of standards. We have over 1.6 million. You can use them for free forever. If you're interested in getting involved and using the infrastructure to host your customer's custom standards, that's also free! If so, reach out to scott (scott at commoncurriculum.com).

# Where does this all live?

- The API is running as an Edge Function on [Supabase](https://www.supabase.com)
- The standards are stored in a Postgres Database on Supabase and the embeddings are stored using the `pgvector` extension and are [indexed with an HNSW index](https://supabase.com/blog/increase-performance-pgvector-hnsw).

# But show me the code. How does this magic work?

It all comes down to this query:

```ts
const result = await connection.queryObject`
    with embedding as (
      select embeddings
      from standards
      where id = ${standard_id}
    )

    select
      standards.id,
      standards.description,
      standards.statement_notation,
      1 - (standards.embeddings <=> embedding.embeddings) as similarity
    from standards, embedding
    where
      standards.jurisdiction_id = ${jurisdiction_id} and
      standards.embeddings <=> embedding.embeddings < 1 - 0.25
    order by standards.embeddings <=> embedding.embeddings
    limit ${count};
  `
```

# Can I see an example?

Sure!

**Some easy examples:**

1. [Matching a Maryland HS standard to a standard in the Common Core](https://eorycauazbxncugxuwto.supabase.co/functions/v1/match_standard?standard_id=11179ED9013540D4AB575FC0B282C3D6&jurisdiction_id=67810E9EF6944F9383DCC602A3484C23)

2. [Matching a Maryland elementary standard to a standard in the Common Core](https://eorycauazbxncugxuwto.supabase.co/functions/v1/match_standard?standard_id=E24481EF280941E793D9DBBF885F3626&jurisdiction_id=67810E9EF6944F9383DCC602A3484C23)

3. [Matching a Common Core standard to Maryland Standards](https://eorycauazbxncugxuwto.supabase.co/functions/v1/match_standard?standard_id=41064C0B98A4460181333BF337E74EF3&jurisdiction_id=49FCDFBD2CF04033A9C347BFA0584DF0)

**A harder example which shows the value**:

4. [Matching a Maryland math standard to Texas standards](https://eorycauazbxncugxuwto.supabase.co/functions/v1/match_standard?standard_id=B642AB10DFE701310AB168A86D17958E&jurisdiction_id=49FCDFBD2CF04033A9C347BFA0584DF0)
   - Source standard: "use phonological knowledge to match sounds to letters to construct unknown words;"
   - Top Matched standard: "Spell untaught words phonetically, drawing on phonemic awareness and spelling conventions."

# Can I use this?

Sure! Reach out to Scott (scott at commoncurriculum.com)

# Like, for free?

Most likely! We're not looking to make any money on this (our main gig is [Common Curriculum, the collaborative lesson planner](https:/www.commoncurriculum.com)), so any cost would just be the cost of the service.

# This is cool, what are the next steps?

1. **Getting the API ready for production.** The API implementation is clearly POC and would need to be cleaned up -- e.g. there isn't any auth or rate limiting. However, I'm not sure if people just want to hit the database directly. If so, it might not make sense to build out that API. If you want to talk to the DB, reach out to Scott and we can make it happen.

2. **Importing the rest of the standards.** I only imported MD, TX, and the Common Core standards. Importing the rest isn't a big job, but just needs to be done.

3. **Continuosly importing from Common Standards Project**. I haven't hooked it up to continuously import from Common Standards Project as new standards come in. This isn't hard to do, either -- it just needs to be done.

4. **Validating this is the right embedding model with the right number of dimensions**. I used OpenAI's `text-embedding-3-large` because it was easy and has performed well on the MTEB benchmarks. It's possible `text-embedding-3-small` would be better and it's possible we need to store fewer or more dimensions (I stored 1024 dimensions). Also, it's possible there are other embedding models which would be better suited. To figure this out, a team needs to spend some time running tests to find the most performant way to search for embeddings that produces the highest quality matches.

5. **Validating pgvector is the most appropriate and not Pinecone**. I think pgvector is as fast as Pinecone, but it's probably worth someone checking.

# What are your next steps, Scott?

- After some teams interested in using this can confirm which embedding model and how many dimensions to store are best, I'll hook up the pipeline so it's continously updated from Common Standards Project.
- At this point, I won't be making the API production ready as it's not something we need for our app and we don't currently have the time to devote resources to do.
- Continuing to host this POC and (if it gets traction), the database with the entire Common Standards Project corpus.

# I'd like to help turn this API into something production ready.

Awesome! Reach out to Scott (scott at commoncurriculum).

- If you'd like to continue the work with Supabase (my preference as it's serverless), I can invite as a collaborator on this repo and give you access to the Supabase project.

- If you want to create the API differently and just need access to the DB, I'm happy to give you the credentials to connect to it.
