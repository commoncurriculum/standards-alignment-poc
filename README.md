# Using Embeddings to Align Standards

This proof-of-concept uses [OpenAI's newest embeddings](https://openai.com/blog/new-embedding-models-and-api-updates#:~:text=Native%20support%20for%20shortening%20embeddings) to find matching standards. To learn how embeddings work, read [this summary on OpenAI's blog](https://openai.com/blog/introducing-text-and-code-embeddings). Here's two illustrations from that blog post:

![Animation showing how embeddings work](https://cdn.openai.com/new-and-improved-embedding-model/draft-20221214a/vectors-2.svg)

![Animation showing how embeddings work](https://cdn.openai.com/new-and-improved-embedding-model/draft-20221214a/vectors-3.svg)

All embeddings were create with `text-embedding-3-large` and stored at 1024 dimensions.

# Where does the source data come from?

![CleanShot 2024-03-22 at 10 34 29](https://github.com/commoncurriculum/standards-alignment-poc/assets/100121/fdada56a-3e75-429a-a4ba-0156e2f5b578)

[Common Standards Project](https://www.commonstandardsproject.com), the open source repository of standards. We have over 1.6 million. You can use them for free forever. If you're interested in getting involved and using the infrastructure to host your customer's custom standards, that's also free! If so, reach out to scott (scott at commoncurriculum.com).

# Where does this all live?

- The API is running as an Edge Function on [Supabase](https://www.supabase.com)
- The standards are stored in a Postgres Database on Supabase and the embeddings are stored using the `pgvector` extension and are [indexed with an HNSW index](https://supabase.com/blog/increase-performance-pgvector-hnsw).


# Can I see an example?

Sure! [Here's a Maryland math standard matched to Texas standards](https://eorycauazbxncugxuwto.supabase.co/functions/v1/match_standard?standard_id=B642AB10DFE701310AB168A86D17958E&jurisdiction_id=49FCDFBD2CF04033A9C347BFA0584DF0)

- **Source standard** "use phonological knowledge to match sounds to letters to construct unknown words;"
- **First matched standard** "Spell untaught words phonetically, drawing on phonemic awareness and spelling conventions."
  <details>
      <summary>
      API Response
      </summary>

  ```json
  {
    "matching_from": {
      "jurisdiction_id": "28903EF2A9F9469C9BF592D4D0BE10F8",
      "jurisdiction_title": "Texas",
      "standard": {
        "id": "B642AB10DFE701310AB168A86D17958E",
        "description": "use phonological knowledge to match sounds to letters to construct unknown words;",
        "jurisdiction_id": "28903EF2A9F9469C9BF592D4D0BE10F8",
        "jurisdiction_title": "Texas",
        "list_id": "(A)",
        "position": 69000,
        "standard_set_id": "28903EF2A9F9469C9BF592D4D0BE10F8_D100036C_grade-02",
        "standard_set_title": "Grade 2",
        "standard_set_status": "Published",
        "statement_notation": "ELA 2.23A",
        "subject": "English Language Arts and Reading (2010)",
        "ancestor_ids": [
          "B64268E0DFE701310AB068A86D17958E",
          "B63353A0DFE701310A7F68A86D17958E"
        ]
      }
    },
    "matching_to": {
      "jurisdiction_id": "49FCDFBD2CF04033A9C347BFA0584DF0",
      "jurisdiction_title": "Maryland",
      "matched_standards": [
        {
          "id": "6BF9628CE81C4264934C07E2164A8919",
          "description": "Spell untaught words phonetically, drawing on phonemic awareness and spelling conventions.",
          "jurisdiction_id": "49FCDFBD2CF04033A9C347BFA0584DF0",
          "jurisdiction_title": "Maryland",
          "list_id": null,
          "position": 113000,
          "standard_set_id": "49FCDFBD2CF04033A9C347BFA0584DF0_D2605668_grade-01",
          "statement_notation": "CCSS 1 L 2.e",
          "standard_set_title": "Grade 1",
          "standard_set_status": "Published",
          "subject": "English Language Arts (2011)",
          "ancestor_ids": [
            "2B8E6AD9B5A143B5A059E35CF2EFEF5F",
            "3028A9B598B04A09814A0CEFA7A52C2B",
            "6BFE571725CC42419216890B8BD95FE4",
            "E811AD999AD84FD19B02F843232C16D5"
          ],
          "similarity": "0.674182255614863"
        },
        {
          "id": "1DA37A87DED0463C90B2BD3309FCB383",
          "description": "Spell simple words phonetically, drawing on knowledge of sound-letter relationships.",
          "jurisdiction_id": "49FCDFBD2CF04033A9C347BFA0584DF0",
          "jurisdiction_title": "Maryland",
          "list_id": null,
          "position": 105000,
          "standard_set_id": "49FCDFBD2CF04033A9C347BFA0584DF0_D2605668_grade-k",
          "statement_notation": "CCSS K L 2.d",
          "standard_set_title": "Grade K",
          "standard_set_status": "Published",
          "subject": "English Language Arts (2011)",
          "ancestor_ids": [
            "9AB0CC1F6AD146DE9F41AB0F30CD1BDA",
            "7E91FAE18284406EB23225709E87AF09",
            "4E9649A1D13F49FA978B1F3A734E207A",
            "BAEB9B8E6D944019B7DB571FA0A39EC3"
          ],
          "similarity": "0.653339505195622"
        },
        {
          "id": "6304B4FD32444278B8F71CBFB472809C",
          "description": "Spell untaught words phonetically, drawing on phonemic\nawareness and spelling conventions.",
          "jurisdiction_id": "49FCDFBD2CF04033A9C347BFA0584DF0",
          "jurisdiction_title": null,
          "list_id": "e",
          "position": 1099,
          "standard_set_id": "3FC2D02A6B4B469D9800867F326B8734",
          "statement_notation": "L.1.2.e",
          "standard_set_title": null,
          "standard_set_status": null,
          "subject": "English Language Arts (2022)",
          "ancestor_ids": [
            "2ACBC5E8F1B64A4BB8F6B07EDAF1F7D2",
            "D9670809F5874CBDB5C25B4605B1FD79",
            "591A9BE3E0614F6D9AC6A00DBB44708F"
          ],
          "similarity": "0.652125161632876"
        }
      ]
    }
  }
  ```

    </details>

**Other examples: same standard in different jurisdictions:**

- [Matching a Maryland HS standard to a standard in the Common Core](https://eorycauazbxncugxuwto.supabase.co/functions/v1/match_standard?standard_id=11179ED9013540D4AB575FC0B282C3D6&jurisdiction_id=67810E9EF6944F9383DCC602A3484C23)
- [Matching a Common Core standard to Maryland Standards](https://eorycauazbxncugxuwto.supabase.co/functions/v1/match_standard?standard_id=41064C0B98A4460181333BF337E74EF3&jurisdiction_id=49FCDFBD2CF04033A9C347BFA0584DF0)

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

# How accurate are these matches?
It appears very accurate. From reports of another edtech company using a similar approach with a much older embedding model, they found the matches to be just as accurate as hand made matches.


# Can I use this?

Sure! Reach out to Scott (scott at commoncurriculum.com)

# Like, for free?

Most likely! We're not looking to make any money on this (our main gig is [Common Curriculum, the collaborative lesson planner](https:/www.commoncurriculum.com)), so any cost would just be the cost of the service.

# This is cool, what are the next steps?

1. **Getting the API ready for production.** The API implementation is clearly POC and would need to be cleaned up -- e.g. there isn't any auth or rate limiting. However, I'm not sure if people just want to hit the database directly. If so, it might not make sense to build out that API. If you want to talk to the DB, reach out to Scott and we can make it happen.

2. **Importing the rest of the standards and continuously importing from Common Standards Project** I only imported MD, TX, and the Common Core standards. Importing the rest isn't a big job, but just needs to be done. Also, I haven't hooked it up to continuously import from Common Standards Project as new standards come in. This isn't hard to do, either -- it just needs to be done.

3. **Validating pgvector is the most appropriate and not Pinecone**. I think pgvector is as fast as Pinecone, but it's probably worth someone checking.

4. **Comparing results to hand made alignments and validating this is the right embedding model with the right number of dimensions and the right query and the right similarity score**.

      a. __Comparing results to hand made validations__ To guide the work, a few pairs of standard sets should be used to compare the results of this approach. The results of those tests will help answer the questions below

      b. __Right Embedding model/number of dimensions?__ I used OpenAI's `text-embedding-3-large` because it was easy and has performed well on the MTEB benchmarks. It's possible `text-embedding-3-small` would be better and it's possible we need to store fewer or more dimensions (I stored 1024 dimensions). Also, it's possible there are other embedding models which would be better suited. To figure this out, a team needs to spend some time running tests to find the most performant way to search for embeddings that produces the highest quality matches.

      c. __Right index paramters/tweaks?__ Most likely, we'd want to add [filtering by partioning the table by `jurisdiction_id`](https://github.com/pgvector/pgvector?tab=readme-ov-file#filtering). Also, we'd want to look at the [`m`, `ef_construction` and `lists` parameters](https://supabase.com/docs/guides/ai/choosing-compute-addon#finetune-index-parameters) to see if we can get higher QPS with the same accuracy. Fast index creation speed is neither a goal nor requirement, so we can spend longer on index creation for higher QPS.

      d. __Right query? Likely, we should constrain results to +/- one grade level__ Right now, it queries for all standards in a jurisdiction that have a cosign similarity score above 0.25. In production, I think the query needs one important tweak: It needs to search for standards within +/- 1 grade level. For instance, even if a 1st grade standard around spelling is substantially similiar to a 5th grade standard, the activities, assessments, and lessons will be dramatically different. Instead, I think a search should query for standards that are a grade level above/below the standard being searched.

      e. __Right similarity score?__ I don't know the right similarity score. People need to do some work to validate the matches against manually created matches


# How much more work/time will it take to turn this POC into reality?

The API is probably a week? Validating the embeddings/query/similarity score are correct will probably take two engineers about two weeks. To finish importing all the standards will take Scott a couple days. I'll await to hear if there's a need before embarking on that work.

# Of the next steps, what are you doing to do, Scott?

- **Importing all the standards**. After some teams interested in using this can confirm which embedding model and how many dimensions to store are best, I'll hook up the pipeline so it's continously updated from Common Standards Project.
- **Assisting but not building the API**: At this point, I won't be making the API production ready as it's not something we need for our app and we don't currently have the time to devote resources to do.
- **Paying for hosting**: Continuing to host this POC and (if it gets traction), the database with the entire Common Standards Project corpus.

# I'd like to help turn this API into something production ready.

Awesome! Reach out to Scott (scott at commoncurriculum dot com).

- If you'd like to continue the work with Supabase (my preference as it's serverless), I can invite as a collaborator on this repo and give you access to the Supabase project.

- If you want to create the API differently and just need access to the DB, I'm happy to give you the credentials to connect to it.
